<template>
  <div class="visualizer">
    <div class="blurFilter" v-if="blur"></div>
    <component
      ref="ins"
      v-if="shouldRender"
      :is="vComponent"
      :name="vComponent"
      :audioData="audioData"
    ></component>
  </div>
</template>

<script>
import BarVisualizer from "../../visualizers/BarVisualizer.vue";
import SpaceVisualizer from "../../visualizers/SpaceVisualizer.vue";
import ColorPoly from "../../visualizers/ColorPoly.vue";
import Swirl from "../../visualizers/swirl/Swirl.vue";
import PurpleSpace from "../../visualizers/purpleSpace/PurpleSpace.vue";

const visualizers = {
  "Visualizer Off": null,
  "Space Visualizer": "space",
  "Bar Visualizer": "bar",
  "Space with Polygon": "spacePoly",
  "Colored Polygon": "colorPoly",
  Swirl: "swirl",
  "Purple Space": "purpleSpace",
};

export default {
  name: "Visualizer",
  props: ["autoUpdate", "setVisualizer", "setBlur"],
  components: {
    bar: BarVisualizer,
    space: SpaceVisualizer,
    spacePoly: SpaceVisualizer,
    colorPoly: ColorPoly,
    swirl: Swirl,
    purpleSpace: PurpleSpace,
  },
  data: function () {
    return {
      visualizerArr: visualizers,
      vComponent: null,
      blur: false,
      audioDataLoaded: false,
    };
  },
  mounted() {
    window.addEventListener("resize", this.resizeCanvas, false);
    window.addEventListener("orientationchange", this.resizeCanvas, false);
    if (this.setVisualizer) this.vComponent = this.setVisualizer;
    if (this.setBlur) this.blur = this.setBlur;
    if (!this.$store.state.visualizerArr) {
      this.$store.commit("setVisualizerArr", visualizers);
    }
    if (this.audioData) this.audioDataLoaded = true;
    if (this.autoUpdate) this.update();
    this.$nextTick(() => {
      this.$store.commit("setVisualizerIns", this.$refs.ins);
      if (this.$store.state.theme?.themeStyle && this.$refs.ins) {
        this.$refs.ins.themeStyle = this.$store.state.theme.themeStyle;
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeCanvas);
    window.removeEventListener("orientationchange", this.resizeCanvas);
    this.audioDataLoaded = false;
    this.vComponent = null;
  },
  methods: {
    renderVisualizer(time) {
      if (!this.shouldRender) return;
      this.$refs.ins?.update(time);
    },
    setVisualizerByKey(name) {
      this.vComponent = visualizers[name];
    },
    update(time) {
      if (!this.autoUpdate || !this.shouldRender) return;
      requestAnimationFrame(this.update.bind(this));
      this.renderVisualizer(time);
    },
    resizeCanvas() {
      if (!this.shouldRender) return;
      this.$refs.ins.resizeCanvas();
    },
  },
  watch: {
    audioData() {
      if (this.audioData) this.audioDataLoaded = true;
    },
    setVisualizer() {
      if (!this) return;
      this.vComponent = this.setVisualizer;
    },
    setBlur() {
      this.blur = this.setBlur;
    },
  },
  computed: {
    currentVisualizer() {
      return Object.keys(visualizers).find(
        (key) => visualizers[key] === this.vComponent
      );
    },
    audioData() {
      return this.$store.state.audio.audioData;
    },
    shouldRender() {
      return this.audioDataLoaded && this.vComponent;
    },
  },
};
</script>

<style scoped></style>
