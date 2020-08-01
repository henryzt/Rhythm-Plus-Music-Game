<template>
  <div>
    <Navbar v-if="showNav"></Navbar>
    <UserProfileCard></UserProfileCard>
    <div
      v-if="imageSrc"
      class="bgImage"
      :style="{
        background: `url('${imageSrc}') no-repeat fixed center`,
        backgroundSize: 'cover',
      }"
    ></div>
    <Visualizer
      v-else-if="$store.state.theme"
      ref="visualizer"
      style="opacity: 1;"
      :setVisualizer="$store.state.theme.visualizer"
      :setBlur="$store.state.theme.blur"
      :autoUpdate="true"
    ></Visualizer>
  </div>
</template>

<script>
import Visualizer from "./Visualizer.vue";
import Navbar from "../ui/Navbar.vue";
import UserProfileCard from "./UserProfileCard.vue";

export default {
  name: "PageBackground",
  props: {
    songSrc: {
      type: String,
      default: null,
    },
    visualizer: {
      type: String,
      default: "purpleSpace",
    },
    imageSrc: {
      type: String,
      default: null,
    },
    showNav: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Visualizer,
    UserProfileCard,
    Navbar,
  },
  data() {
    return {
      audio: null,
    };
  },
  mounted() {
    if (this.songSrc) {
      this.$store.state.audio.loadSong(this.songSrc, true);
    } else {
      this.$store.state.audio.playBgm();
    }
  },
  destroyed() {},
};
</script>

<style scoped>
.bgImage {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  opacity: 0.5;
  z-index: -1;
}
</style>
