<template>
  <div>
    <!-- <audio ref="audioElement" :src="songSrc" autoplay loop preload="auto"></audio> -->
    <AudioPlayback ref="audioElement" :songSrc="songSrc"></AudioPlayback>

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
import AudioPlayback from '../components/AudioPlayback.vue';

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
      AudioPlayback
  },
  data(){
        return {
            audio: null
        }
    },
    mounted() {
        this.audio = this.$refs.audioElement;
        // this.audio.load();
    }
};
</script>

<style scoped>
</style>