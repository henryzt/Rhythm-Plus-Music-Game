<template>
  <div>
    <audio ref="audioElement" src="songs/login.mp3" autoplay preload="auto"></audio>

    <div class="center_logo">
      <h3>Signin or Register Now for Complete Experience!</h3>
      <div id="firebaseui-auth-container"></div>
    </div>

    <Visualizer ref="visualizer" :audio="audio" :setVisualizerNo="1" :autoUpdate="true"></Visualizer>
  </div>
</template>


<script>
import Visualizer from '../components/Visualizer.vue';
import firebase from 'firebase';
import * as firebaseui from "firebaseui"
import "firebaseui/dist/firebaseui.css";

export default {
  name: 'Auth',
  components:{
      Visualizer
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

        const uiConfig = {
            signInSuccessUrl: '/game',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
                ]
        };
        let ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', uiConfig);

    },
  methods: {

  }
};
</script>

<style scoped>
</style>