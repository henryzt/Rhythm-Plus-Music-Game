<template>
  <div class="top-progress" :style="barStyle">
    <div class="peg" :style="pegStyle"></div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  data() {
    return {
      opacity: 1,
      updateInterval: null,
      barStyle: {},
    };
  },
  props: {
    speed: {
      type: Number,
      default: 350,
    },
    progress: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#29d",
    },
    colorShadow: String,
    height: {
      type: Number,
      default: 3,
    },
    zIndex: {
      type: Number,
      default: 5000,
    },
  },
  mounted() {
    this.updateInterval = setInterval(() => {
      this.barStyle = {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        width: `${this.progress * 100}%`,
        height: `${this.height}px`,
        backgroundColor: this.progressColor,
        transition: `all ${this.speed}ms linear`,
        boxShadow: `0 3px 10px ${this.boxShadow}, 0 0 5px ${this.boxShadow}`,
        opacity: `${this.opacity}`,
        zIndex: `${this.zIndex}`,
      };
    }, 100);
  },
  beforeDestroy() {
    clearInterval(this.updateInterval);
  },
  computed: {
    progressColor() {
      return this.error ? this.errorColor : this.color;
    },
    boxShadow() {
      return this.colorShadow || this.progressColor;
    },
    pegStyle() {
      return {
        display: "block",
        position: "absolute",
        right: "0",
        width: "100px",
        height: "100%",
        opacity: "1",
        transform: "rotate(3deg) translate(0px, -4px)",
      };
    },
  },
};

// ref https://github.com/dalphyx/vue-top-progress/blob/master/src/top-progress.vue
</script>
