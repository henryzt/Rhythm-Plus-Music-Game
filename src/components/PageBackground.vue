<template>
  <div>
    <UserProfileCard></UserProfileCard>
    <div
      v-if="imageSrc"
      class="bgImage"
      :style="{ background: `url('${imageSrc}') no-repeat fixed center`, backgroundSize: 'cover' }"
    ></div>
    <Visualizer v-else ref="visualizer" :setVisualizerNo="visualizerNo" :autoUpdate="true"></Visualizer>
  </div>
</template>


<script>
import Visualizer from '../components/Visualizer.vue';
import UserProfileCard from './UserProfileCard.vue';

export default {
  name: 'PageBackground',
  props: {
    songSrc : {
      type: String,
      default: "songs/login.mp3"
    },
    visualizerNo : {
      type: Number,
      default: 1
    },
    imageSrc : {
      type: String,
      default: null
    },
  },
  components:{
      Visualizer,
      UserProfileCard
  },
  data(){
        return {
            audio: null
        }
    },
    mounted() {
        this.$store.state.audio.loadSong(this.songSrc, true)
    },
    destroyed(){
        this.$store.state.audio.stop()
    }
};
</script>

<style scoped>
.bgImage {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  opacity: 0.5;
  z-index: -1;
}
</style>