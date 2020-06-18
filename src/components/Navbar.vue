<template>
  <div class="navbar">
    <div class="nav">
      <v-icon name="home" scale="2" />
      <div class="navtext">Home</div>
    </div>
    <div class="nav">
      <v-icon name="stream" scale="1.7" />
      <div class="navtext">Song Select</div>
    </div>
    <div class="nav">
      <v-icon name="medal" scale="1.7" />
      <span class="navtext">Rankings</span>
    </div>
    <div class="nav">
      <v-icon name="cog" scale="1.7" />
      <span class="navtext">Account & Options</span>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/home'
import 'vue-awesome/icons/stream'
import 'vue-awesome/icons/medal'
import 'vue-awesome/icons/cog'

export default {
    name: "Navbar",
}
</script>

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
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

.nav {
  padding: 20px;
  opacity: 0.5;
  align-items: center;
  overflow: hidden;
  display: flex;
  transition: 0.5s;
  cursor: pointer;
  box-sizing: border-box;
  min-width: 72px;
  width: 72px;
  max-width: 72px;
}

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
</style>