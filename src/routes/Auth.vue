<template>
  <div>
    <PageBackground songSrc="songs/login.mp3"></PageBackground>

    <div class="center_logo">
      <div v-show="!$store.state.currentUser">
        <h3>Signin or Register Now for Complete Experience!</h3>
        <div id="firebaseui-auth-container"></div>
      </div>
      <div v-show="$store.state.currentUser">
        You are already logged in!
        <div class="text_button" @click="confirmSignOut">Logout</div>
      </div>
    </div>
    <Modal
      ref="modal"
      :show="showModal"
      bodyText="Are you sure you want to log out?"
      okText="Logout"
      @ok="signOut"
    ></Modal>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import Modal from '../components/Modal.vue';
import firebase from 'firebase';
import * as firebaseui from "firebaseui"
import "firebaseui/dist/firebaseui.css";

export default {
  name: 'Auth',
  components:{
      PageBackground,
      Modal
  },
  data(){
        return {
            showModal: false
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {
        const uiConfig = {
            signInSuccessUrl: '/',
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
                ]
        };
        let ui = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', uiConfig);

    },
  methods: {
      confirmSignOut(){
        this.$refs.modal.show()
      },
      signOut(){
        try{
          firebase.auth().signOut();
        }catch(err){
          console.error(err)
        }
      }
  }
};
</script>

<style scoped>
</style>