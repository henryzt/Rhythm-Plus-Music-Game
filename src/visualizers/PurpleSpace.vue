<template>
  <canvas ref="visualizerCanvas"></canvas>
</template>

<script>
import VolumeSampler from "./VolumeSampler";

let sampler, ctx, w, h, prevTime;

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
    ctx = this.ctx;
  },
  methods: {
    update(time) {
      this.ctx.fillStyle = "rgba(10,10,44,0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      renderBarVisualizer(time, this.canvas, this.ctx, this.audioData);
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

const makeStars = (count) => {
  const out = [];
    for (let i=0;i<count;i++){
      const s = {
        x: Math.random()*1600-800,
        y: Math.random()*900-450,
        z: Math.random()*1000
      };
    out.push(s);
  }
  return out;
}

let stars = makeStars(3000);

const putPixel = (x, y, brightness) => {
  const intensity = brightness * 255;
  const rgb = `rgba(255,255,255,${brightness})`;
  ctx.fillStyle = rgb;
  ctx.fillRect(x, y, 2, 2);
};

const moveStars = (distance) => {
  const count = stars.length;
  for (var i = 0; i < count; i++) {
    const s = stars[i];
    s.z -= distance;
    while (s.z <= 1){
      s.z += 1000;
    }
  }
}

const tick = (time, v) => {
  let elapsed = time - prevTime;
  prevTime = time;

  moveStars(elapsed*0.06);

  const cx = w/2;
  const cy = h/2;

  for (var i = 0; i < stars.length; i++) {
    const star = stars[i];

    const x = cx + star.x/(star.z * 0.001);
    const y = cy + star.y/(star.z * 0.001);

    if (x < 0 || x >= w || y < 0 || y >= h){
      continue;
    }

    const d = (star.z/1000.0)
    const b = 1-d*d

    putPixel(x, y, b);
  }

};

function renderBarVisualizer(time, canvas, ctx, audioData) {
  w = canvas.width;
  h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const x = w / 2,
    y = h / 2,
    innerRadius = 1,
    outerRadius = Math.max(w, h);
  const v = getVolume();
  const v2 = v * 2 > 1 ? 1 : v * 2;

  let grd = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  grd.addColorStop(v/5, "black");
  grd.addColorStop(1, `rgba(238, 0, 255, ${v2})`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  if(!prevTime) prevTime = time;
  tick(time, v);
}

// ref https://medium.com/better-programming/fun-with-html-canvas-lets-create-a-star-field-a46b0fed5002
</script>