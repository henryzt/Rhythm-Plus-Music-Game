<template>
  <div id="app" class="unselectable">
    <PageBackground v-if="$store.state.audio && $route.meta.requireBg && showOnPageRequireSignin"></PageBackground>
    <ModalGlobal ref="gm"></ModalGlobal>
    <FloatingAlert ref="alert"></FloatingAlert>
    <transition name="fade" v-if="$store.state.audio">
      <router-view :key="$route.path" v-if="showOnPageRequireSignin && !$store.state.redirecting" />
      <div v-else>
        <div class="center blink_me">
          <img src="/assets/logo2.png" style="max-width: 350px; padding: 20px 0; width:100%;" />
          <div>Logging you in...</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Audio from './javascript/audio.js';
import ModalGlobal from './components/ModalGlobal.vue';
import FloatingAlert from './components/FloatingAlert.vue';
import PageBackground from './components/PageBackground.vue';
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/volume-mute'
import 'vue-awesome/icons/expand'
import 'vue-awesome/icons/compress'

export default {
  name: 'App',
  components: {
    ModalGlobal,
    FloatingAlert,
    PageBackground
  },
  mounted(){
    this.$store.commit("setAudio", new Audio());
    this.$store.commit("setGlobalModal", this.$refs.gm);
    this.$store.commit("setFloatingAlert", this.$refs.alert);
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus(e) {
      const isOnline = e.type === 'online';
      if(isOnline)
        this.$store.state.alert.success("You are back online!")
      else
        this.$store.state.alert.error("No internet connection")
    }
  },
  computed:{
    showOnPageRequireSignin(){
      return !this.$route.meta.requireSignin || (this.$store.state.initialized && this.$route.meta.requireSignin);
    }
  }
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

.blink_me {
  opacity: 0.5;
  animation: blinker 2s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0.2;
  }
}
</style>
