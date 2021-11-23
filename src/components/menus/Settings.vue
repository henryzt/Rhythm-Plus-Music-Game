<template>
  <div class="settings">
    <div class="animate__animated animate__zoomIn">
      <div class="st_title">Profile Settings</div>
      <form>
        <p>
          <label>Display Name</label>
          <input
            v-model="profileSt.displayName"
            name="displayName"
            placeholder="Display Name"
            type="text"
          />
        </p>
        <p>
          <label>Email</label>
          <input
            v-model="profileSt.email"
            name="email"
            placeholder="Email"
            type="text"
            disabled
          />
        </p>
        <p>
          <label>User ID</label>
          <input
            v-model="profileSt.uid"
            name="uid"
            placeholder="UID"
            type="text"
            disabled
          />
        </p>
        <p>
          <label>Avatar</label>
          <input
            v-model="profileSt.photoURL"
            name="photoURL"
            placeholder="Avatar URL"
            type="text"
          />
        </p>
        <p>
          <label>Password</label>
          <input type="button" value="Reset password" @click="resetPassword" />
        </p>
      </form>
    </div>

    <div class="animate__animated animate__zoomIn animate__delay-1s">
      <div class="st_title">Appearance Settings</div>
      <form>
        <p>
          <label>Main Theme</label>
          <select
            id="songSelect"
            v-model="appearanceSt.theme"
            @change="changeVisualizer"
          >
            <option value="flameOrange">Flame Orange</option>
            <option value="darkPurple">Dark Purple</option>
          </select>
        </p>
        <p v-if="$store.state.visualizerArr">
          <label>Visualizer</label>
          <select id="visualizer" v-model="appearanceSt.visualizer">
            <option
              v-for="[key, value] in Object.entries($store.state.visualizerArr)"
              :value="value"
              :key="key"
            >
              {{ key }}
            </option>
          </select>
        </p>
        <p v-if="visualizerIns && visualizerIns.options">
          <label>Theme Style</label>
          <select id="themeStyle" v-model="visualizerIns.themeStyle">
            <option
              v-for="[key, value] in Object.entries(
                visualizerIns.options.themeStyle.data
              )"
              :value="value"
              :key="key"
            >
              {{ key }}
            </option>
          </select>
        </p>
        <p>
          <label></label>
          <Checkbox
            label="Blur Background"
            :model="appearanceSt"
            cbStyle="form"
            modelKey="blur"
          ></Checkbox>
        </p>
        <p>
          <label></label>
          <Checkbox
            label="Sync Plays to YouTube"
            :model="appearanceSt"
            cbStyle="form"
            modelKey="syncYoutube"
          ></Checkbox>
        </p>
      </form>
    </div>

    <div
      class="animate__animated animate__zoomIn animate__delay-2s"
      style="position: relative; z-index: 900"
    >
      <div class="st_title">Game Preferences</div>
      <p>
        <label>Key Mappings</label>
        <KeyMappings class="keyMap" v-model="preference.keyMap"></KeyMappings>
      </p>
    </div>

    <div class="animate__animated animate__zoomIn animate__delay-3s">
      <div class="st_title">Default Game Settings</div>
      <play-control
        :playData="gameSt"
        :formStyle="true"
        :settingStyle="true"
      ></play-control>

      <div class="btn-action btn-dark" @click="saveSettings">
        <v-icon name="arrow-right" />
        <span>Save Changes</span>
      </div>
    </div>

    <transition name="modal-fade">
      <div class="banner" v-if="changed">Unsaved changes</div>
    </transition>

    <div class="discord_banner flex_hori" v-if="showDiscordBanner">
      <v-icon name="brands/discord" scale="2"></v-icon>
      <div style="padding: 0 10px">
        <a href="https://discord.gg/ZGhnKp4" target="_blank"
          >Be one of the first to join <br />our new
          <span style="text-decoration: underline">discord server</span>!</a
        >
      </div>
      <v-icon
        name="times"
        style="cursor: pointer"
        @click="hideDiscord"
      ></v-icon>
    </div>

    <Loading style="position: relative; z-index: 999" :show="loading"
      >Saving...</Loading
    >
  </div>
</template>

<script>
import Checkbox from "../ui/Checkbox.vue";
import PlayControl from "../common/PlayControl.vue";
import Loading from "../ui/Loading.vue";
import KeyMappings from "./KeyMappings.vue";
import firebase from "firebase/app";
import { updateUserProfile } from "../../javascript/db";
import { getMeta, setMeta } from "../../helpers/storage";
import "vue-awesome/icons/brands/discord";

export default {
  name: "Settings",
  components: {
    Checkbox,
    PlayControl,
    Loading,
    KeyMappings,
  },
  data: function () {
    return {
      profileSt: {
        displayName: null,
        email: null,
        uid: null,
        photoURL: null,
      },
      appearanceSt: {
        theme: "darkPurple",
        visualizer: "purpleSpace",
        blur: false,
        syncYoutube: false,
        options: null,
      },
      preference: {
        keyMap: null,
      },
      gameSt: {
        noteSpeed: 1,
        vibrate: true,
        noFail: false,
        perspective: false,
        blur: false,
        fps: false,
      },
      loading: false,
      changed: false,
      firstChanged: false,
      showDiscordBanner: !getMeta("st_discord_showed"),
    };
  },
  mounted() {
    this.getUserSettings();
  },
  computed: {
    visualizerIns() {
      return this.$store.state.visualizerIns;
    },
    settings() {
      return {
        pf: this.profileSt,
        pr: this.preference,
        gm: this.gameSt,
        ap: this.appearanceSt,
      };
    },
  },
  watch: {
    settings: {
      handler() {
        if (this.loading) return;
        if (this.firstChanged) {
          this.changed = true;
        } else {
          this.firstChanged = true;
        }
      },
      deep: true,
    },
    "$store.state.userProfile"() {
      this.getUserSettings();
    },
    "appearanceSt.visualizer"() {
      this.$store.state.bg.overrideOptions = this.appearanceSt;
      this.$store.state.bg.rerender();
    },
  },
  beforeDestroy() {
    this.$store.state.bg.overrideOptions = null;
    this.$store.state.bg.rerender();
  },
  methods: {
    changeVisualizer() {
      if (this.appearanceSt.theme === "darkPurple") {
        this.appearanceSt.visualizer = "purpleSpace";
      }
      if (this.appearanceSt.theme === "flameOrange") {
        this.appearanceSt.visualizer = "space";
      }
    },
    getUserSettings() {
      this.loading = true;
      const user = this.$store.state.currentUser;
      const profile = this.$store.state.userProfile;
      if (user) {
        const { displayName, email, uid, photoURL } = user;
        this.profileSt = { displayName, email, uid, photoURL };
      }
      if (profile?.appearanceSt) {
        this.appearanceSt = profile.appearanceSt;
      }
      if (profile?.gameSt) {
        this.gameSt = profile.gameSt;
      }
      if (profile?.preference) {
        this.preference = profile.preference;
      }
      this.loading = false;
    },
    async saveSettings() {
      this.loading = true;
      const { displayName, photoURL } = this.profileSt;

      try {
        const user = firebase.auth().currentUser;
        await user.updateProfile({ displayName, photoURL });

        if (this.visualizerIns?.options) {
          this.appearanceSt.options = {
            themeStyle: this.visualizerIns.themeStyle,
          };
        } else {
          this.appearanceSt.options = null;
        }

        await updateUserProfile({
          appearanceSt: this.appearanceSt,
          gameSt: this.gameSt,
          preference: this.preference,
        });

        this.$router.push({ query: { success: true } });
        this.$router.go();
      } catch (err) {
        this.loading = false;
        Logger.error(err);
      }
    },
    async resetPassword() {
      const doContinue = await this.$store.state.gModal.show({
        bodyText:
          "Warning! Reseting your password would log your account out anywhere, and clear all social login tokens. Would you like to continue?",
        okText: "Reset",
        type: "warning",
      });
      if (!doContinue) return;
      const auth = firebase.auth();
      auth
        .sendPasswordResetEmail(this.profileSt.email)
        .then(() => {
          this.$store.state.alert.success("Password reset email sent");
        })
        .catch(() => {
          this.$store.state.alert.error(
            "Sorry, something went wrong, please try again later.",
            8000
          );
        });
    },
    hideDiscord() {
      setMeta("st_discord_showed", true);
      this.showDiscordBanner = false;
    },
  },
};
</script>

<style scoped>
.st_title {
  margin: 30px 0;
  margin-top: 40px;
  font-size: 2em;
}
form {
  display: table;
  width: 100%;
}
p {
  display: table-row;
  width: 100%;
}
label {
  display: table-cell;
  width: 25%;
  text-align: right;
  padding-right: 10px;
}
input {
  display: table-cell;
}
.fa-icon {
  vertical-align: middle;
  margin-right: 5px;
}
.btn-dark {
  background: rgba(78, 78, 78, 0.575);
  line-height: 30px;
  margin-top: 50px;
  max-width: 100%;
}
.btn-dark:hover {
  background: white;
}

.settings {
  --animate-delay: 0.1s;
}

.keyMap {
  margin-left: auto;
}

.banner {
  background: rgb(255, 115, 0);
  text-align: center;
  padding: 10px 0;
  bottom: 70px;
  position: fixed;
  left: calc(50% - 150px);
  width: 300px;
  z-index: 900;
  box-shadow: 4px 3px 24px -2px rgba(255, 115, 0, 0.5);
}

.discord_banner {
  text-align: left;
  background: rgb(81, 0, 148);
  padding: 10px 20px;
  top: 70px;
  position: fixed;
  left: calc(50% - 150px);
  width: 300px;
  z-index: 900;
  box-shadow: 4px 3px 24px -2px rgba(81, 0, 148, 0.5);
}

@media only screen and (max-width: 1000px) {
  label {
    width: 35%;
  }
}
</style>
