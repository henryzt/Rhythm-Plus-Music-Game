<template>
  <div>
    <PageBackground songSrc="songs/login.mp3"></PageBackground>

    <div class="center_logo">
      <h3>Signin or Register Now for Complete Experience!</h3>
      <div id="firebaseui-auth-container"></div>
    </div>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import firebase from 'firebase';
import * as firebaseui from "firebaseui"
import "firebaseui/dist/firebaseui.css";

export default {
  name: 'Auth',
  components:{
      PageBackground
  },
  data(){
        return {
            
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {
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