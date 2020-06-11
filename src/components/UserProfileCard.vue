<template>
  <div class="profile_card" :class="{extend}" @click="goToAccount">
    <img v-if="$store.state.profilePicture" :src="$store.state.profilePicture" />
    <div class="detail" v-if="$store.state.authed">
      <div>{{$store.state.currentUser.displayName}}</div>
      <div
        style="opacity:0.6"
        v-if="$store.state.userProfile.lvd"
      >Level.{{$store.state.userProfile.lvd}}</div>
      <div class="wrapper" v-if="extend">
        <div class="progress-bar">
          <span class="progress-bar-fill increased" :style="{width: percentage+'%'}"></span>
          <span class="progress-bar-fill" :style="{width: percentage+'%'}"></span>
        </div>
      </div>
    </div>

    <div v-else>
      <div
        style="padding:10px"
        v-if="!extend"
      >{{$store.state.initialized ? "Login / Register" : "Loading..."}}</div>
      <div style="opacity:0.5" v-else>
        Login or Register now
        <br />to sync your progress and exp
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name:"UserProfileCard",
    props: ["extend"],
    computed: {
      percentage(){
        const dec = this.$store.state.userProfile.lv - this.$store.state.userProfile.lvd;
        return dec*100;
      }
    },
    methods:{
      goToAccount(){
        if(!this.extend)
          this.$router.push('/account')
      }
    }
}
</script>

<style scoped>
.profile_card {
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  opacity: 0.5;
  padding: 5px;
  background: rgba(0, 0, 0, 0.5);
  background: linear-gradient(
    195deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  cursor: pointer;
  z-index: 500;
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 10px;
}
img {
  max-width: 50px;
  max-height: 50px;
}

.extend {
  background: none;
  position: relative;
  right: auto;
  top: auto;
  opacity: 1;
  font-size: 1.2em;
  cursor: auto;
}

.extend img {
  max-width: 100px;
  max-height: 100px;
}

.wrapper {
  width: 100%;
  max-width: 200px;
  min-width: 170px;
}

.progress-bar {
  width: 100%;
  background-color: #838383;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  margin: 10px 0;
  height: 5px;
  position: relative;
}

.progress-bar-fill {
  display: block;
  background-color: #ff9900;
  transition: width 500ms ease-in-out;
  position: absolute;
  height: 5px;
  left: 0;
}

.increased {
  background-color: #ffd900;
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .extend {
    font-size: 1em;
  }
  .extend img {
    max-width: 70px;
    max-height: 70px;
  }
}
</style>
