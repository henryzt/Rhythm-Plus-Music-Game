<template>
  <div>
    <PageBackground songSrc="/songs/login.mp3"></PageBackground>

    <div class="center_logo">
      <div v-show="!$store.state.authed">
        <h3>Signin or Register Now for Complete Experience!</h3>
        <div id="firebaseui-auth-container"></div>
      </div>
      <div v-show="$store.state.authed">
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

    <Loading :show="!$store.state.initialized">Communicating...</Loading>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import Modal from '../components/Modal.vue';
import Loading from '../components/Loading.vue';
import firebase from 'firebase';
import * as firebaseui from "firebaseui"
import "firebaseui/dist/firebaseui.css";

export default {
  name: 'Auth',
  components:{
      PageBackground,
      Modal,
      Loading
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
            ],
        autoUpgradeAnonymousUsers: true,
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            return true;
          },
          // handle merge conflicts which occur when an existing credential is linked to an anonymous user.
          signInFailure: async (error) => {
            if (error.code != 'firebaseui/anonymous-upgrade-merge-conflict') {
              console.error(error)
              return Promise.resolve();
            }
            console.warn(error)
                    // Hold a reference to the anonymous current user.
            let anonymousUser = firebase.auth().currentUser;
            let cred = error.credential;
            let app = firebase.app();
            // Save anonymous user data first.
            try{
              if(this.$store.state.userProfile.exp > 5)
                await firebase.firestore().collection("users").doc(anonymousUser.uid).set({isAnonymousDeleted: true})
              await anonymousUser.delete();
            }catch(err){
              console.error(err)
            }

            try{
              await firebase.auth().signInWithCredential(cred);
              window.location.assign('/');
            }catch(err){
              console.error(err)
            }
          }
        }
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