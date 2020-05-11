<template>
  <div>
    <!-- <audio ref="audioElement" :src="songSrc" autoplay loop preload="auto"></audio> -->

    <Visualizer
      ref="visualizer"
      :audioSrc="songSrc"
      :setVisualizerNo="visualizerNo"
      :autoUpdate="true"
    ></Visualizer>
  </div>
</template>


<script>
import Visualizer from '../components/Visualizer.vue';

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
  },
  components:{
      Visualizer,
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
</style>