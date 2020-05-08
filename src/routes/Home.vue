<template>
  <div>
    <audio ref="audioElement" src="songs/opening.mp3" autoplay preload="auto"></audio>

    <div class="center_logo">
      <img src="assets/logo.png" style="max-width: 550px; padding: 50px;" />
      <Button text="Start Game" @click="goToGame"></Button>
      <div class="login" @click="goToAuth">Login or Reigster</div>
    </div>

    <Visualizer ref="visualizer" :audio="audio" :setVisualizerNo="1" :autoUpdate="true"></Visualizer>
  </div>
</template>

<script>
import Visualizer from '../components/Visualizer.vue';
import Button from '../components/Button.vue';



export default {
    name: 'Home',
    components: {
        Visualizer,
        Button
    },
    data(){
        return {
            audio: null
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {
        this.audio = this.$refs.audioElement;
        this.audio.load();

    },
    methods:{
        goToGame(){
            this.$router.push('/game')
        },
        goToAuth(){
            this.$router.push('/login')
        },
    }
};
</script>

<style scoped>
.login {
  padding: 10px;
  cursor: pointer;
  z-index: 100;
  transition: 1s;
  opacity: 0.5;
}

.login:hover {
  transform: scale(1.2);
  opacity: 1;
}
</style>
