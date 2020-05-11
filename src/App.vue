<template>
  <div id="app" class="unselectable">
    <AudioPlayback ref="audioElement"></AudioPlayback>
    <transition name="fade" v-if="$store.state.audio">
      <router-view />
    </transition>
  </div>
</template>

<script>
import AudioPlayback from './components/AudioPlayback.vue';

export default {
  name: 'App',
  components: {
    AudioPlayback
  },
  mounted(){
    this.$store.state.audio = this.$refs.audioElement;
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
