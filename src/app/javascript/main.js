import { demo } from "./demo.js";
import { DropTrack } from "./track.js";
import { getPlayerTime, resetVideo, playVideo, loadYoutubeVideo } from "./youtube.js";
require("./control.js");

//visualizers
const visualizerArr = [
  "Visualizer Off",
  "Space Visualizer",
  "Bar Visualizer",
  "Space with Polygon",
  "Space Blurred",
];

//vue app
let app = new Vue({
  el: "#app",
  data: {
    audio: null,
    canvas: null,
    canvasCtx: null,
    checkHitLineY: null, //hit line postion (white line)
    noteSpeedPxPerSec: null, //note speed
    visualizerLoaded: false, //visualizer loaded indicator
    playMode: false, //play or edit mode
    noteSpeedInSec: 2,
    currentSong: "",
    loadFrom: "",
    saveTo: "",
    score: 0,
    combo: 0,
    maxCombo: 0,
    marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
    lastMark: "",
    demoList: Object.keys(demo),
    currentDemoNotes: "",
    showControl: false,
    visualizer: 2,
    visualizerArr: visualizerArr,
    srcMode: "youtube",
  },
  computed: {
    mode: function() {
      return this.playMode ? "Play Mode" : "Create Mode";
    },
  },
  mounted: function() {
    this.$watch("currentSong", () => {
      audio.load();
    });
    this.$watch("noteSpeedInSec", () => {
      reposition();
    });
  },
});

app.canvas = app.$refs.mainCanvas;
app.canvasCtx = app.canvas.getContext("2d");
let canvas = app.canvas;
let ctx = app.canvasCtx;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let timeArr = [];
let timeArrIdx = 0;

//time elapsed relative to audio play time (+Number(app.noteSpeedInSec))
let playTime = 0;

//get audio element
app.audio = app.$refs.control.$refs.audioElement;
let audio = app.audio;

// init play tracks
let dropTrackArr = [];

let trackNum = 4;
let trackKeyBind = ["d", "f", "j", "k"];
let trackMaxWidth = 150;

function reposition() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let trackWidth =
    canvas.width / trackNum > trackMaxWidth ? trackMaxWidth : canvas.width / trackNum;
  let startX = canvas.width / 2 - (trackNum * trackWidth) / 2;
  let counter = 0;
  for (let track of dropTrackArr) {
    dropTrackArr[counter].resizeTrack(startX + trackWidth * counter + counter, trackWidth);
    counter++;
  }

  app.checkHitLineY = (canvas.height / 10) * 9;
  app.noteSpeedPxPerSec = app.checkHitLineY / Number(app.noteSpeedInSec);
}

for (let keyBind of trackKeyBind) {
  dropTrackArr.push(new DropTrack(0, trackMaxWidth, keyBind, app));
}

reposition();

window.addEventListener("resize", function(event) {
  console.log("resize");
  reposition();
});

// log key and touch events
function onKeyDown(key) {
  if (!app.playMode) {
    let cTime = getCurrentTime();
    console.log(cTime, key);
    timeArr.push({ time: cTime, key: key });
  }
  for (track of dropTrackArr) {
    track.keyDown(key);
  }
}

window.onload = function() {
  document.addEventListener(
    "keydown",
    (event) => {
      onKeyDown(event.key);
    },
    false
  );

  canvas.addEventListener(
    "touchstart",
    function(e) {
      for (var c = 0; c < e.changedTouches.length; c++) {
        // touchInf[e.changedTouches[c].identifier] = {"x":e.changedTouches[c].clientX,"y":e.changedTouches[c].clientY};
        let x = e.changedTouches[c].clientX,
          y = e.changedTouches[c].clientY;

        dropTrackArr.forEach(function(track) {
          if (x > track.x && x < track.x + track.width) {
            onKeyDown(track.keyBind);
          }
        });
      }
    },
    false
  );

  //start animate
  animate();
};

// animate all
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderVisualizer();
  for (let track of dropTrackArr) {
    track.update();
  }
}

//render visualizer
function renderVisualizer() {
  if (!app.visualizerLoaded) return;
  switch (app.visualizer) {
    case 1:
      renderSpaceVisualizer();
      break;
    case 2:
      renderBarVisualizer();
      ctx.fillStyle = "rgba(10,10,44,0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    case 3:
      renderSpaceVisualizer(true);
      break;
    case 4:
      renderSpaceVisualizer(true);
      break;
    default:
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

//clock for counting time
let intervalPlay = null;

function playGame() {
  timeArrIdx = 0;
  audio.currentTime = 0;
  resetVideo();
  let startTime = Date.now();
  app.playMode = true;

  let intervalPrePlay = setInterval(async function() {
    let elapsedTime = Date.now() - startTime;
    playTime = Number(elapsedTime / 1000);
    console.log(playTime, Number(app.noteSpeedInSec));
    if (playTime > Number(app.noteSpeedInSec)) {
      try {
        if (app.srcMode == "url") {
          res = await audio.play();
          console.log("audio playing", res, audio.canplay);
        } else if (app.srcMode == "youtube") {
          playVideo();
        }
      } catch (e) {
        console.error(e);
      }
      initAllVisualizersIfRequried();
      clearInterval(intervalPrePlay);
      intervalPlay = setInterval(() => {
        playTime = getCurrentTime() + Number(app.noteSpeedInSec);
      }, 100);
    }
  }, 100);
}

function getCurrentTime() {
  return app.srcMode == "youtube" ? getPlayerTime() : audio.currentTime;
}

function resetPlaying() {
  clearInterval(intervalPlay);
  timeArr = [];
  timeArrIdx = 0;
  playTime = 0;
  app.playMode = false;
  audio.pause();
  audio.currentTime = 0;
}

function startSong(song) {
  resetPlaying();
  app.currentSong = song.url;
  audio.load();
  window.loadFromDemo(song.noteName);
  app.visualizer = song.visualizerNo ? song.visualizerNo : app.visualizer;
  playGame();
}

function toggleControl() {
  app.showControl = !app.showControl;
}

function toggleVisualizer() {
  app.visualizer = app.visualizer == visualizerArr.length - 1 ? 0 : app.visualizer + 1;
}