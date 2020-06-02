<template>
  <div id="app" class="unselectable">
    <ModalGlobal ref="gm"></ModalGlobal>
    <transition name="fade" v-if="$store.state.audio">
      <router-view />
    </transition>
  </div>
</template>

<script>
import Audio from './javascript/audio.js';
import ModalGlobal from './components/ModalGlobal.vue';

export default {
  name: 'App',
  components: {
    ModalGlobal
  },
  mounted(){
    this.$store.commit("setAudio", new Audio());
    this.$store.commit("setGlobalModal", this.$refs.gm);
  }
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
