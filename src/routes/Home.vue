<template>
  <div>
    <PageBackground songSrc="/songs/opening.mp3"></PageBackground>

    <div class="center_logo">
      <img
        src="assets/logo.png"
        style="max-width: 550px; padding: 50px 0; width:100%;box-sizing: border-box;"
      />
      <Button text="Start Game" @click="goToGame"></Button>
      <div
        class="text_button"
        @click="goToAuth"
      >{{$store.state.currentUser ? "Welcome, "+$store.state.currentUser.displayName:"Login or Reigster"}}</div>
    </div>
  </div>
</template>

<script>
import PageBackground from '../components/PageBackground.vue';
import Button from '../components/Button.vue';



export default {
    name: 'Home',
    components: {
        PageBackground,
        Button
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

    },
    methods:{
        goToGame(){
            this.$router.push('/menu')
        },
        goToAuth(){
            this.$router.push('/account')
        },
    }
};
</script>

<style scoped>
</style>
