<template>
  <div>
    <UserProfileCard></UserProfileCard>
    <Visualizer ref="visualizer" :setVisualizerNo="visualizerNo" :autoUpdate="true"></Visualizer>
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
</style>