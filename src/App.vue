<template>
  <div id="app" class="unselectable">
    <PageBackground
      v-if="
        $store.state.audio && $route.meta.requireBg && showOnPageRequireSignin
      "
    ></PageBackground>
    <ModalGlobal ref="gm"></ModalGlobal>
    <FloatingAlert ref="alert"></FloatingAlert>
    <transition name="fade" v-if="$store.state.audio">
      <keep-alive
        :include="['SongSelect', 'MyStudio']"
        v-if="showOnPageRequireSignin && !$store.state.redirecting"
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
    window.addEventListener("online", this.updateOnlineStatus);
    window.addEventListener("offline", this.updateOnlineStatus);
    this.updateOnlineStatus();
  },
  beforeDestroy() {
    window.removeEventListener("online", this.updateOnlineStatus);
    window.removeEventListener("offline", this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus(e) {
      if (!e?.type) return;
      const isOnline = e.type === "online" || window.navigator.onLine;
      if (isOnline) this.$store.state.alert.success("You are back online!");
      else this.$store.state.alert.error("No internet connection");
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
</style>
