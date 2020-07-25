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
          <input type="button" value="Reset password" />
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
            <option value="flameSpace">Flame Space</option>
            <option value="purpleSwirl">Dark Purple Swirl</option>
          </select>
        </p>
        <p v-if="$store.state.visualizerArr">
          <label>Visualizer</label>
          <select id="visualizer" v-model="appearanceSt.visualizer">
            <option
              v-for="[key, value] in Object.entries($store.state.visualizerArr)"
              :value="value"
              :key="key"
              >{{ key }}</option
            >
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
      </form>
    </div>

    <div class="animate__animated animate__zoomIn animate__delay-2s">
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

    <Loading style="z-index: 999;" :show="loading">Saving...</Loading>
  </div>
</template>

<script>
import Checkbox from "../ui/Checkbox.vue";
import PlayControl from "../common/PlayControl.vue";
import Loading from "../ui/Loading.vue";
import firebase from "firebase/app";
import { updateUserProfile } from "../../javascript/db";

export default {
  name: "Settings",
  components: {
    Checkbox,
    PlayControl,
    Loading,
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
        theme: "purpleSwirl",
        visualizer: "swirl",
        blur: false,
      },
      gameSt: {
        noteSpeed: 1,
        vibrate: true,
        perspective: false,
        blur: false,
      },
      loading: false,
    };
  },
  mounted() {
    this.getUserSettings();
  },
  watch: {
    "$store.state.userProfile"() {
      this.getUserSettings();
    },
  },
  methods: {
    changeVisualizer() {
      if (this.appearanceSt.theme === "purpleSwirl") {
        this.appearanceSt.visualizer = "swirl";
      }
      if (this.appearanceSt.theme === "flameSpace") {
        this.appearanceSt.visualizer = "space";
      }
    },
    getUserSettings() {
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
    },
    async saveSettings() {
      this.loading = true;
      const { displayName, photoURL } = this.profileSt;

      try {
        const user = firebase.auth().currentUser;
        await user.updateProfile({ displayName, photoURL });

        await updateUserProfile({
          appearanceSt: this.appearanceSt,
          gameSt: this.gameSt,
        });

        this.$router.push({ query: { success: true } });
        this.$router.go();
      } catch (err) {
        this.loading = false;
        Logger.error(err);
      }
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

@media only screen and (max-width: 1000px) {
  label {
    width: 35%;
  }
}
</style>
