<template>
  <div>
    <PageBackground songSrc="songs/opening.mp3"></PageBackground>

    <div class="center_logo">
      <img
        src="assets/logo.png"
        style="max-width: 550px; padding: 50px 0; width:100%;box-sizing: border-box;"
      />
      <Button text="Start Game" @click="goToGame"></Button>
      <div class="login" @click="goToAuth">Login or Reigster</div>
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
