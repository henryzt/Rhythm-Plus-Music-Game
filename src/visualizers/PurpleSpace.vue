<template>
  <canvas ref="visualizerCanvas"></canvas>
</template>

<script>
export default {
  name: "PurpleSpace",
  props: ["audioData"],
  data: function () {
    return {
      canvas: null,
      ctx: null,
    };
  },
  mounted() {
    this.canvas = this.$refs.visualizerCanvas;
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
  },
  methods: {
    update() {
      this.ctx.fillStyle = "rgba(10,10,44,0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      renderBarVisualizer(this.canvas, this.ctx, this.audioData);
    },
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
  },
};

function renderBarVisualizer(canvas, ctx, audioData) {
  let grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#ee9ca7");
  grd.addColorStop(1, "#C6FFDD");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
</script>