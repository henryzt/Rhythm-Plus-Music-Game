<template>
  <div>
    <PageBackground songSrc="songs/login.mp3"></PageBackground>

    <div class="center_logo">
      <div v-show="!$store.state.currentUser">
        <h3>Signin or Register Now for Complete Experience!</h3>
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import Modal from '../components/Modal.vue';

export default {
  name: 'Result',
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

    },
    methods: {

    }
};
</script>

<style scoped>
</style>