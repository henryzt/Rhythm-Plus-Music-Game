<template>
  <div>
    <progressive-background v-if="themeStyle!=='bgOff'" class="spaceBackground" src="/assets/purpleSpace.jpg" />
    <canvas ref="visualizerCanvas"></canvas>
  </div>
</template>

<script>
import VolumeSampler from "../VolumeSampler";

let sampler, ctx, w, h, prevTime;

export default {
  name: "PurpleSpace",
  props: ["audioData"],
  data: function () {
    return {
      canvas: null,
      ctx: null,
      options: {
        themeStyle: {
          type: "dropdown",
          data: {
            "Show Background Image & Gradient": "bg1",
            "Background Image Only": "bg1Only",
            "Mask Background Image": "bg1Mask",
            "Hide Background Image": "bgOff",
          },
        },
      },
      themeStyle: "bg1Mask",
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
      renderSpaceVisualizer(time, this.canvas, this.ctx, this.audioData, this);
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

const colors = ["white"];

const makeStars = (count) => {
  const out = [];
  for (let i = 0; i < count; i++) {
    const s = {
      x: Math.random() * 1600 - 800,
      y: Math.random() * 900 - 450,
      z: Math.random() * 1000,
      vWeight: Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    out.push(s);
  }
  return out;
};

let stars = makeStars(700);

const putPixel = (x, y, brightness, v, star) => {
  // const intensity = brightness * 0.5 + v * star.vWeight;
  const intensity = brightness * (Math.max(v * 2, 0.3) + 0.2);
  // const rgb = `rgba(255,255,255,${intensity})`;
  // ctx.globalAlpha=intensity;
  ctx.fillStyle = `rgba(255,255,255,${intensity})`;
  // ctx.fillStyle = star.color;
  ctx.fillRect(x, y, 3, 3);
  // ctx.strokeStyle = `rgba(255,255,255,${v - 0.5})`;
  // ctx.lineWidth = 0.1;
  // ctx.strokeRect(x, y, 3, 3);
  // ctx.globalAlpha=1;
};

const moveStars = (distance, v) => {
  const count = stars.length;
  for (var i = 0; i < count; i++) {
    const s = stars[i];
    s.z -= distance + distance * v * s.vWeight;
    while (s.z <= 1) {
      s.z += 1000;
    }
  }
};

const tick = (time, v) => {
  let elapsed = time - prevTime;
  prevTime = time;

  moveStars(elapsed * 0.02 + v, v);

  const cx = w / 2;
  const cy = h / 2;

  for (var i = 0; i < stars.length; i++) {
    const star = stars[i];

    const x = cx + star.x / (star.z * 0.001);
    const y = cy + star.y / (star.z * 0.001);

    if (x < 0 || x >= w || y < 0 || y >= h) {
      continue;
    }

    const d = star.z / 1000.0;
    const b = 1 - d * d;

    putPixel(x, y, b * 0.6, v, star);
  }
};

const bgColors = [
  [27, 63, 171],
  [10, 166, 201],
  [169, 10, 201],
];
let nextBgIdx = 1;
let currentBg = bgColors[Math.floor(Math.random() * bgColors.length)];

function moveBgColor() {
  const newVal = (from, to) => {
    const delta = from - to > 0 ? -0.1 : 0.1;
    return Math.floor(from) == to ? Math.floor(from) : from + delta;
  };
  const nextBg = bgColors[nextBgIdx];
  currentBg[0] = newVal(currentBg[0], nextBg[0]);
  currentBg[1] = newVal(currentBg[1], nextBg[1]);
  currentBg[2] = newVal(currentBg[2], nextBg[2]);
  // console.log(currentBg, nextBg)
  if (
    currentBg[0] == nextBg[0] &&
    currentBg[1] == nextBg[1] &&
    currentBg[2] == nextBg[2]
  ) {
    nextBgIdx++;
    if (nextBgIdx >= bgColors.length) nextBgIdx = 0;
  }
}

function renderSpaceVisualizer(time, canvas, ctx, audioData, vm) {
  w = canvas.width;
  h = canvas.height;

  const x = w / 2,
    y = h / 2,
    innerRadius = 1,
    outerRadius = Math.max(w, h);
  const v = getVolume();
  const v2 = v * 2 > 1 ? 1 : v * 2;
  const vmin = v - 0.35 < 0 ? 0 : v - 0.35;
  const blackColorStop = h < w ? 0.15 : 0.1; // ? laptop : mobile

  ctx.fillStyle = `rgba(0,0,0,0.4)`;
  ctx.clearRect(0, 0, w, h);
  ctx.fillRect(0, 0, w, h);

  if (vm.themeStyle !== "bg1Only") {
    const innerColour = vm.themeStyle === "bgOff" || vm.themeStyle === "bg1Mask" ? "black" : "rgba(0,0,0,0.5)";
    let grd = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    grd.addColorStop(blackColorStop, innerColour);
    grd.addColorStop(
      1,
      `rgba(${currentBg[0]}, ${currentBg[1]}, ${currentBg[2]}, ${v - 0.25})`
    );
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  if (!prevTime) prevTime = time;
  tick(time, v);
  moveBgColor();
}

// ref https://medium.com/better-programming/fun-with-html-canvas-lets-create-a-star-field-a46b0fed5002
</script>

<style scoped>
.spaceBackground {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  background-size: cover;
  animation: zoom 20s ease-in-out infinite alternate;
}

@keyframes zoom {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.5);
  }
}
</style>