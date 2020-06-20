<template>
  <div id="app" class="unselectable">
    <ModalGlobal ref="gm"></ModalGlobal>
    <FloatingAlert ref="alert"></FloatingAlert>
    <transition name="fade" v-if="$store.state.audio">
      <router-view :key="$route.path" />
    </transition>
  </div>
</template>

<script>
import Audio from './javascript/audio.js';
import ModalGlobal from './components/ModalGlobal.vue';
import FloatingAlert from './components/FloatingAlert.vue';

export default {
  name: 'App',
  components: {
    ModalGlobal,
    FloatingAlert
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
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
