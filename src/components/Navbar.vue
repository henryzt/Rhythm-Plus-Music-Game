<template>
  <div>
    <div class="navbar mainNav" v-if="!gameNav">
      <router-link to="/" exact>
        <div class="nav">
          <v-icon name="home" scale="2" />
          <div class="navtext">Home</div>
        </div>
      </router-link>
      <router-link to="/menu">
        <div class="nav">
          <v-icon name="stream" scale="1.7" />
          <div class="navtext">Song Select</div>
        </div>
      </router-link>
      <router-link to="/rankings">
        <div class="nav">
          <v-icon name="medal" scale="1.7" />
          <span class="navtext">Rankings</span>
        </div>
      </router-link>
      <router-link to="/account">
        <div class="nav">
          <v-icon name="cog" scale="1.7" />
          <span class="navtext">Account & Options</span>
        </div>
      </router-link>
    </div>

    <div class="navbar gameNav" v-else>
      <router-link to="/menu" exact>
        <div class="nav">
          <v-icon name="home" scale="1.5" />
          <div class="navtext">Back</div>
        </div>
      </router-link>
      <div class="nav">
        <v-icon
          :name="$store.state.isFullscreen?'compress':'expand'"
          scale="1.5"
          @click="$store.commit('toggleFullscreen')"
        />
        <div class="navtext">Toggle Fullscreen</div>
      </div>
      <div class="nav">
        <v-icon name="share" scale="1.5" />
        <div class="navtext">Share</div>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/home'
import 'vue-awesome/icons/stream'
import 'vue-awesome/icons/medal'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/share'

export default {
    name: "Navbar",
    props: ["gameNav"]
}
</script>

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  max-width: 80%;
  overflow: scroll;
  z-index: 800;
  scrollbar-width: none;
}

.navtext {
  /* display: grid; */
  padding-left: 0;
  /* overflow: hidden; */
  max-width: 0;
  box-sizing: border-box;
  white-space: nowrap;
  opacity: 0;
  transition: padding-left 0.5s, max-width 0.5s, opacity 0.5s;
  pointer-events: none;
}

.mainNav {
  background: rgba(0, 0, 0, 0.5);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}

a {
  text-decoration: none;
}

.nav {
  padding: 20px;
  opacity: 0.5;
  align-items: center;
  overflow: hidden;
  display: flex;
  transition: 0.5s;
  cursor: pointer;
  box-sizing: border-box;
  min-width: 68px;
  width: 68px;
  max-width: 68px;
  color: white;
  text-align: center;
}

.nav:hover {
  background: rgba(255, 255, 255, 0.7);
  color: black;
  opacity: 1;
}

.gameNav .nav {
  min-width: 48px;
  width: 48px;
  max-width: 48px;
}

.router-link-active .nav {
  opacity: 0.9;
  /* border-bottom: solid 3px rgb(255, 255, 255); */
}

@media only screen and (min-width: 800px) {
  /* desktop */

  .nav:hover {
    background: rgba(255, 255, 255, 0.7);
    color: black;
    opacity: 1;
    width: auto;
    max-width: 100%;
  }

  .nav:hover .navtext {
    padding-left: 10px;
    max-width: 100%;
    width: 100%;
    opacity: 1;
  }
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .mainNav {
    top: auto;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    max-width: 100%;
    background: rgba(0, 0, 0, 0.7);
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
}
</style>