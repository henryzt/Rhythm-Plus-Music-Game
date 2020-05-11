<template>
  <div id="app" class="unselectable">
    <transition name="fade" v-if="$store.state.audio">
      <router-view />
    </transition>
  </div>
</template>

<script>
import Audio from './javascript/audio.js';

export default {
  name: 'App',
  components: {
  },
  mounted(){
    this.$store.state.audio = new Audio();
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
