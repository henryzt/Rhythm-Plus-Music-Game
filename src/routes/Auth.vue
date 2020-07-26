<template>
  <div :class="{ cutBottom: !$store.state.authed }">
    <div class="mContainer" v-if="$store.state.verified">
      <div class="flex_hori">
        <UserProfileCard :extend="true" />
        <div class="clip" @click="confirmSignOut">Logout</div>
      </div>
      <Settings></Settings>
    </div>

    <div class="center_logo" style="position: absolute;">
      <div v-show="!$store.state.authed">
        <h3>Signin or Register Now for Complete Experience!</h3>
        <div id="firebaseui-auth-container"></div>
      </div>
      <div v-if="$store.state.authed && !$store.state.verified">
        <div style="font-size: 20px; padding-bottom: 30px;">
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

    <Modal
      ref="modal"
      :show="showModal"
      style="z-index: 1000;"
      bodyText="Are you sure you want to log out?"
      okText="Logout"
      @ok="signOut"
    ></Modal>

    <Loading style="z-index: 999;" :show="!$store.state.initialized"
      >Communicating...</Loading
    >
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
    };
  },
  computed: {},
  watch: {},
  mounted() {
    const uiConfig = {
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
      autoUpgradeAnonymousUsers: true,
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          Logger.log(authResult);
          this.signInRedirect();
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
            )
              await firebase
                .firestore()
                .collection("users")
                .doc(anonymousUser.uid)
                .set({ isAnonymousDeleted: true });
            await anonymousUser.delete();
          } catch (err) {
            Logger.error(err);
          }

          try {
            this.$store.state.redirecting = true;
            await firebase.auth().signInWithCredential(cred);
            this.signInRedirect();
          } catch (err) {
            Logger.error(err);
          }
        },
      },
    };

    let ui =
      firebaseui.auth.AuthUI.getInstance() ??
      new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", uiConfig);

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
      } catch (err) {
        Logger.error(err);
      }
    },
    signInRedirect() {
      this.$store.state.redirecting = true;
      const user = firebase.auth().currentUser;

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
};
</script>

<style scoped>
.disabled {
  cursor: not-allowed;
  opacity: 0.2;
}

.mContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: 2s;
  width: 90%;
  max-width: 600px;
  margin: auto;
  margin-top: 100px;
  margin-bottom: 300px;
}

.flex_hori {
  display: flex;
  align-items: center;
  flex-direction: row;
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
</style>
