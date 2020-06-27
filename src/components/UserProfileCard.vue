<template>
  <div class="profile_card" :class="{extend}">
    <div class="controls" v-if="!extend">
      <v-icon
        :name="$store.state.audio.muteBg?'volume-mute':'volume-up'"
        scale="1.3"
        @click="$store.state.audio.toggleBgMute()"
      />
      <v-icon :name="isFullscreen?'compress':'expand'" scale="1.3" @click="toggleFullscreen" />
    </div>

    <div v-if="$store.state.authed" @click="goToAccount" style="display:flex;align-items: center;">
      <img v-if="$store.state.profilePicture" :src="$store.state.profilePicture" />
      <div class="detail">
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
    </div>

    <div v-else @click="goToAccount">
      <div
        style="padding:10px"
        v-if="!extend"
        v-html="$store.state.initialized ? 'Login &<br>Register' : 'Loading...'"
      ></div>
      <div style="opacity:0.5;padding:15px;" v-else>
        Login or Register now
        <br />to save your progress and exp
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/volume-up'
import 'vue-awesome/icons/volume-mute'
import 'vue-awesome/icons/expand'
import 'vue-awesome/icons/compress'

export default {
    name:"UserProfileCard",
    props: ["extend"],
    data: function(){
      return {
        isFullscreen: false
      }
    },
    mounted(){
      this.isFullscreen = document.fullscreen;
    },
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
      },
      async toggleFullscreen(){
        this.isFullscreen = document.fullscreen;
        if(this.isFullscreen){
          await document.exitFullscreen();
        }else{
          await document.documentElement.requestFullscreen();
        }
        this.isFullscreen = document.fullscreen;
      }
    }
}
</script>

<style scoped>
.fa-icon {
  padding: 5px;
  cursor: pointer;
  transition: 0.5s;
}
.fa-icon:hover {
  transform: scale(1.3);
}
.controls:hover {
  opacity: 1;
}
.controls {
  padding: 10px;
  opacity: 0.4;
  transition: 0.5s;
}

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
    -90deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  cursor: pointer;
  z-index: 500;
  -webkit-tap-highlight-color: transparent;
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
  .controls {
    position: fixed;
    top: 0;
    left: 0;
    opacity: 1;
    padding: 10px;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .fa-icon {
    padding: 10px;
  }
  .fa-icon:hover {
    transform: none;
  }
}
</style>
