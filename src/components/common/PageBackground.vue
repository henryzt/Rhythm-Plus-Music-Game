<template>
  <div v-if="render">
    <Navbar v-if="showNav && !backgroundOnly"></Navbar>
    <UserProfileCard v-if="!backgroundOnly"></UserProfileCard>
    <div
      v-if="imageSrc"
      class="bgImage"
      :style="{
        background: `url('${imageSrc}') no-repeat fixed center`,
        backgroundSize: 'cover',
      }"
    ></div>
    <Visualizer
      v-else-if="themeOptions"
      ref="visualizer"
      style="opacity: 1"
      :setVisualizer="themeOptions.visualizer"
      :setBlur="themeOptions.blur"
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
    backgroundOnly: {
      type: Boolean,
      default: false,
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
      render: true,
      overrideOptions: null,
    };
  },
  computed: {
    themeOptions() {
      return this.overrideOptions ?? this.$store.state.theme;
    },
  },
  mounted() {
    if (this.songSrc) {
      this.$store.state.audio.loadSong(this.songSrc, true);
    } else {
      this.$store.state.audio.playBgm();
    }
    this.$store.commit("setBackground", this);
  },
  methods: {
    rerender() {
      this.render = false;
      this.$nextTick(() => {
        this.render = true;
      });
    },
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
