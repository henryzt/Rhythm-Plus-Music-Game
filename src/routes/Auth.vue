<template>
  <div>
    <!-- login and verify prompt -->
    <div class="center_logo">
      <div v-show="!$store.state.authed">
        <h2>Signin or Register Now</h2>
        <h4 style="padding-bottom: 30px">for the Complete Experience!</h4>
        <div id="firebaseui-auth-container"></div>
      </div>
      <div v-if="$store.state.authed && !$store.state.verified">
        <div style="font-size: 20px; padding-bottom: 30px">
          Please check your email to verify your account!
        </div>
        <div class="text_button" @click="$router.go()">Refresh</div>
        <div
          class="text_button"
          :class="{ disabled: emailSentTimeout }"
          @click="sendVerificationEmail"
        >
          Resend Email
        </div>
        <div class="text_button" @click="confirmSignOut">Logout</div>
      </div>
    </div>
    <!-- settings -->
    <v-bar class="fullPage" :class="{ cutBottom: !$store.state.authed }">
      <div>
        <div class="mContainer" v-if="$store.state.verified">
          <div class="flex_hori">
            <UserProfileCard :extend="true" />
            <div class="clip" @click="confirmSignOut">Logout</div>
          </div>
          <Settings ref="settings"></Settings>
        </div>
        <div v-else style="min-height: calc(100% - 120px)"></div>

        <div class="centerCredit">
          <div>
            {{
              `App version: ${$store.state.appVersionWithPrefix} · Build: ${$store.state.build}`
            }}
          </div>
          <br />
          <div v-if="$store.state.authed">
            Thank you for playing Rhythm Plus Alpha release, join our
            <a :href="discord" target="_blank">discord server</a> to get lastest
            dev updates. You can report bugs and send feedbacks
            <a :href="bugReport" target="_blank">here</a> or in our
            <a :href="github" target="_blank">GitHub Repo</a>. You can also give
            us a star to support us!
          </div>
          <div v-else>
            <a :href="bugReport" target="_blank">Bug Report</a> ·
            <a :href="discord" target="_blank">Discord</a> ·
            <a :href="github" target="_blank">GitHub Repo</a>
          </div>
        </div>

        <Modal
          ref="modal"
          :show="showModal"
          style="z-index: 1000"
          bodyText="Are you sure you want to log out?"
          type="question"
          okText="Logout"
          @ok="signOut"
        ></Modal>

        <Loading style="z-index: 999" :show="!$store.state.initialized"
          >Communicating...</Loading
        >
      </div>
    </v-bar>
  </div>
</template>

<script>
import Modal from "../components/ui/Modal.vue";
import Loading from "../components/ui/Loading.vue";
import UserProfileCard from "../components/common/UserProfileCard.vue";
import Settings from "../components/menus/Settings.vue";
import firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { logEvent } from "../helpers/analytics";

export default {
  name: "Auth",
  components: {
    Modal,
    Loading,
    UserProfileCard,
    Settings,
  },
  data() {
    return {
      showModal: false,
      emailSentTimeout: false,
      bugReport: "https://forms.gle/8gmuaWU7E9h82i4A7",
      github: "https://github.com/henryz00/Rhythm-Plus-Music-Game",
      discord: "https://discord.gg/ZGhnKp4",
    };
  },
  computed: {},
  watch: {},
  mounted() {
    const uiConfig = {
      signInFlow: "popup",
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          clientId:
            "327500964227-6edgs809uubptud6scj8vt3m5pphnb5i.apps.googleusercontent.com",
        },
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
      autoUpgradeAnonymousUsers: true,
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          Logger.log(authResult);
          this.signInRedirect();
          logEvent("user_signin");
          return true;
        },
        // handle merge conflicts which occur when an existing credential is linked to an anonymous user.
        signInFailure: async (error) => {
          if (error.code !== "firebaseui/anonymous-upgrade-merge-conflict") {
            Logger.error(error);
            return Promise.resolve();
          }
          Logger.warn(error);
          // Hold a reference to the anonymous current user.
          let anonymousUser = firebase.auth().currentUser;
          let cred = error.credential;
          // Save anonymous user data first.
          try {
            if (
              this.$store.state.userProfile &&
              this.$store.state.userProfile.exp > 5
            ) {
              await firebase
                .firestore()
                .collection("users")
                .doc(anonymousUser.uid)
                .set({ isAnonymousDeleted: true });
            }
            await anonymousUser.delete();
            await firebase.auth().signOut();
          } catch (err) {
            Logger.error(err);
          }

          try {
            this.$store.state.redirecting = true;
            const res = await firebase.auth().signInWithCredential(cred);
            Logger.log("login", res);
            anonymousUser = null;
            logEvent("user_signin_a");
            this.signInRedirect();
          } catch (err) {
            Logger.error(err);
          }
        },
      },
    };

    if (!this.$store.state.authed) {
      let ui =
        firebaseui.auth.AuthUI.getInstance() ??
        new firebaseui.auth.AuthUI(firebase.auth());
      ui.start("#firebaseui-auth-container", uiConfig);
    }

    if (this.$route.query.warn) {
      this.$router.push({ query: null });
      this.$store.state.alert.warn(
        "You need to login and verify your account before using the sheet editor",
        8000
      );
    }

    if (this.$route.query.success) {
      this.$router.push({ query: null });
      this.$store.state.alert.success("Settings updated");
      logEvent("settings_updated");
    }
  },
  methods: {
    confirmSignOut() {
      this.$refs.modal.show();
    },
    async signOut() {
      try {
        this.$store.state.redirecting = true;
        await firebase.auth().signOut();
        this.$router.go();
        logEvent("user_signout");
      } catch (err) {
        Logger.error(err);
      }
    },
    signInRedirect() {
      this.$store.state.redirecting = true;
      const user = firebase.auth().currentUser;

      Logger.log("redirected", user);

      if (user.emailVerified) {
        this.$router.push({ path: "/" });
        this.$router.go();
      } else {
        this.$router.go();
        this.sendVerificationEmail();
      }
    },
    sendVerificationEmail() {
      const user = firebase.auth().currentUser;

      user
        .sendEmailVerification()
        .then(() => {
          this.$store.state.alert.success(
            "Verification email sent! Please check your inbox or spam folder."
          );
          this.emailSentTimeout = true;
          setTimeout(() => {
            this.emailSentTimeout = false;
          }, 30000);
          logEvent("verify_email_sent");
        })
        .catch((error) => {
          Logger.error(error);
          if (error.code === "auth/too-many-requests") {
            this.$store.state.alert.error(
              "You have sent to many emails, please try again later.",
              8000
            );
          } else {
            this.$store.state.alert.error(
              "Sorry, something went wrong, please try again.",
              8000
            );
          }
        });
    },
  },
  // beforeRouteLeave: async function (to, from, next) {
  //   const canLeave = await this.$store.state.gModal.show({
  //         bodyText:
  //           "You have unsaved changes, are you sure you want to leave without saving?",
  //         isError: false,
  //         showCancel: true,
  //       });
  //   next(canLeave);
  // },
};
</script>

<style scoped>
.disabled {
  cursor: not-allowed;
  opacity: 0.2;
}

.mContainer {
  width: 90%;
  max-width: 600px;
  margin: auto;
  margin-top: 120px;
  margin-bottom: 100px !important;
}

.centerCredit {
  text-align: center;
  opacity: 0.5;
  width: 100%;
  padding: 0 10px;
  max-width: 600px;
  margin: 50px auto;
  margin-bottom: 100px;
  box-sizing: border-box;
}

.centerCredit a {
  text-decoration: underline;
}

.cutBottom .centerCredit {
  position: fixed;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
}

.flex_hori {
  justify-content: space-between;
}

.clip {
  background: rgba(184, 184, 184, 0.5);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 15px;
  cursor: pointer;
}
.cutBottom {
  height: calc(100% - 70px);
}
.center_logo {
  top: calc(50% - 50px);
  z-index: 500;
  position: absolute;
}
</style>
