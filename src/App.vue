<template>
  <div id="app" class="unselectable">
    <PageBackground
      v-if="
        $store.state.audio &&
        $route.meta.requireBg &&
        showOnPageRequireSignin &&
        !maintenanceMsg
      "
    ></PageBackground>
    <ModalGlobal ref="gm"></ModalGlobal>
    <FloatingAlert ref="alert"></FloatingAlert>
    <transition name="fade" v-if="$store.state.audio">
      <div class="center" v-if="maintenanceMsg">
        <h1>{{ maintenanceMsg.title }}</h1>
        <div v-html="maintenanceMsg.body"></div>
        <img src="/assets/logo2.png" class="maintenance_logo" />
        <div
          v-if="maintenanceMsg.showUpdateButton"
          class="btn-action btn-dark"
          @click="reload"
        >
          Update
        </div>
        <div style="opacity: 0.2">
          {{ maintenanceMsg.currentVersion }} - {{ maintenanceMsg.build }}
        </div>
      </div>
      <keep-alive
        :include="['SongSelect', 'MyStudio']"
        v-else-if="showOnPageRequireSignin && !$store.state.redirecting"
      >
        <router-view class="routerView" :key="$route.path" />
      </keep-alive>
      <div v-else>
        <div class="center blink_me">
          <img src="/assets/logo2.png" class="loading_logo" />
          <div>Logging you in...</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Audio from "./javascript/audio.js";
import ModalGlobal from "./components/ui/ModalGlobal.vue";
import FloatingAlert from "./components/ui/FloatingAlert.vue";
import PageBackground from "./components/common/PageBackground.vue";
import { logEvent } from "./helpers/analytics";
import semver from "semver";
import "vue-awesome/icons/volume-up";
import "vue-awesome/icons/volume-mute";
import "vue-awesome/icons/expand";
import "vue-awesome/icons/compress";
import "vue-awesome/icons/plus";
import "vue-awesome/icons/redo";
import "vue-awesome/icons/cog";
import "vue-awesome/icons/sign-out-alt";
import "vue-awesome/icons/play";
import "vue-awesome/icons/pause";
import "vue-awesome/icons/arrow-right";

export default {
  name: "App",
  components: {
    ModalGlobal,
    FloatingAlert,
    PageBackground,
  },
  mounted() {
    this.$store.commit("setAudio", new Audio());
    this.$store.commit("setGlobalModal", this.$refs.gm);
    this.$store.commit("setFloatingAlert", this.$refs.alert);
    this.listenToUpdates();
    window.addEventListener("online", this.updateOnlineStatus);
    window.addEventListener("offline", this.updateOnlineStatus);
    this.updateOnlineStatus();
  },
  beforeDestroy() {
    window.removeEventListener("online", this.updateOnlineStatus);
    window.removeEventListener("offline", this.updateOnlineStatus);
  },
  data() {
    return {
      refreshing: false,
      registration: null,
      maintenanceMsg: null,
    };
  },
  methods: {
    updateOnlineStatus(e) {
      if (!e?.type) return;
      const isOnline = e.type === "online" || window.navigator.onLine;
      if (isOnline) this.$store.state.alert.success("You are back online!");
      else this.$store.state.alert.error("No internet connection");
      logEvent("online_status_changed", isOnline, "system");
    },
    listenToUpdates() {
      document.addEventListener("swUpdated", this.updateAvailable, {
        once: true,
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.refreshing) return;
        this.refreshing = true;
        console.log("Game is updating...");
        logEvent("game_updated", null, "system");
        window.location.reload();
      });
    },
    reload() {
      window.location.reload(true);
      logEvent("game_force_updated", null, "system");
    },
    // Store the SW registration so we can send it a message
    // We use `updateExists` to control whatever alert, toast, dialog, etc we want to use
    // To alert the user there is an update they need to refresh for
    async updateAvailable(event) {
      logEvent("update_available", null, "system");
      this.registration = event.detail;
      this.$store.state.alert
        .info("A new version of the game is found!", 0, "Update Now")
        .then(() => {
          Logger.log("update accepted");
          logEvent("update_accepted", null, "system");
          // Make sure we only send a 'skip waiting' message if the SW is waiting
          if (!this.registration || !this.registration.waiting) return;
          // send message to SW to skip the waiting and activate the new SW
          this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
        });
    },
  },
  computed: {
    showOnPageRequireSignin() {
      return (
        !this.$route.meta.requireSignin ||
        (this.$store.state.initialized && this.$route.meta.requireSignin)
      );
    },
  },
  watch: {
    async "$store.state.remoteConfig"(config) {
      // const config = this.$store.state.remoteConfig;
      if (!config) return;
      const currentVersion = this.$store.state.appVersion;
      const minimumVersion = config.minimumVersion._value;

      if (semver.lt(currentVersion, minimumVersion)) {
        // show if current version is lower than minimum
        const msg = config.versionTooOldMessage;
        this.maintenanceMsg = JSON.parse(msg._value);
        logEvent("update_required_msg_showed", null, "system");
      } else if (config.maintenanceMode._value === "true") {
        // show otherwise: if has maintenance message
        const msg = config.maintenanceMessage;
        this.maintenanceMsg = JSON.parse(msg._value);
        logEvent("maintenance_mode_showed", null, "system");
      } else if (config.showNotification._value === "true") {
        // show otherwise: if has upcoming update notification
        logEvent("upcoming_update_warning_showed", null, "system");
        const msg = JSON.parse(config.notification._value);
        await this.$store.state.gModal.show({
          titleText: msg.title,
          bodyText: msg.body,
          showCancel: false,
        });
        this.$store.state.alert.warn(msg.short, 8000);
      }

      if (this.maintenanceMsg) {
        this.maintenanceMsg = {
          currentVersion,
          minimumVersion,
          build: this.$store.state.build,
          ...this.maintenanceMsg,
        };
      }
    },
    $route(to) {
      const pageTitle = to.meta.title ? to.meta.title + " - " : "";
      document.title = pageTitle + "Rhythm+ Music Game";
    },
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.routerView {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow-y: scroll;
}

.maintenance_logo {
  margin-top: 50px;
  max-width: 150px;
  opacity: 0.5;
}

.center a {
  color: rgb(127, 255, 255);
  text-decoration: underline;
}
</style>
