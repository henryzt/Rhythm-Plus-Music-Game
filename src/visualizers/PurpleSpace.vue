<template>
  <canvas ref="visualizerCanvas"></canvas>
</template>

<script>
import VolumeSampler from "./VolumeSampler";

let sampler;

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
    sampler = new VolumeSampler(this.audioData);
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

function getVolume() {
  return sampler ? sampler.volume / 10000 : 0;
}

function renderBarVisualizer(canvas, ctx, audioData) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const x = canvas.width / 2,
    y = canvas.height / 2,
    innerRadius = 1,
    outerRadius = canvas.height;
  const v = getVolume();
  const v2 = v * 2 > 1 ? 1 : v * 2;

  let grd = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  grd.addColorStop(v/5, "black");
  grd.addColorStop(1, `rgba(238, 0, 255, ${v})`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
</script>