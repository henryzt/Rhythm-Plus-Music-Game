let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let timeArr = [];
let timeArrIdx = 0;

//time elapsed relative to audio play time (+Number(app.noteSpeedInSec))
let playTime = 0;

//hit indicator gradient
let hitGradient = ctx.createLinearGradient(0, (canvas.height / 10) * 8, 0, canvas.height);
hitGradient.addColorStop(0, "rgba(0,0,0,0)");
hitGradient.addColorStop(1, "yellow");

//hit line postion (white line)
let checkHitLineY = null;

//note speed
let noteSpeedPxPerSec = null;

//vue app
let app = new Vue({
  el: "#app",
  data: {
    playMode: false, //play or edit mode
    mode: this.playMode ? "Play Mode" : "Create Mode",
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
    showControl: false
  },
  mounted: function() {
    this.$watch("currentSong", () => {
      this.$refs.audioElement.load();
    });
    this.$watch("noteSpeedInSec", () => {
      reposition();
    });
  }
});

//get audio element
let audio = app.$refs.audioElement;

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
  for (track of dropTrackArr) {
    dropTrackArr[counter].resizeTrack(startX + trackWidth * counter + counter, trackWidth);
    counter++;
  }

  checkHitLineY = (canvas.height / 10) * 9;
  noteSpeedPxPerSec = checkHitLineY / Number(app.noteSpeedInSec);
}

for (keyBind of trackKeyBind) {
  dropTrackArr.push(new DropTrack(0, trackMaxWidth, keyBind));
}
reposition();

window.addEventListener("resize", function(event) {
  console.log("resize");
  reposition();
});

// log key and touch events
function onKeyDown(key) {
  if (!app.playMode) {
    console.log(audio.currentTime, key);
    timeArr.push({ time: audio.currentTime, key: key });
  }
  for (track of dropTrackArr) {
    track.keyDown(key);
  }
}

window.onload = function() {
  document.addEventListener(
    "keydown",
    event => {
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
};

// animate all
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (track of dropTrackArr) {
    track.update();
  }
}

animate();

//clock for counting time
let intervalPlay = null;

function playGame() {
  timeArrIdx = 0;
  audio.currentTime = 0;
  let startTime = Date.now();
  app.playMode = true;

  let intervalPrePlay = setInterval(function() {
    let elapsedTime = Date.now() - startTime;
    playTime = Number(elapsedTime / 1000);
    console.log(playTime, Number(app.noteSpeedInSec));
    if (playTime > Number(app.noteSpeedInSec)) {
      audio.play();
      clearInterval(intervalPrePlay);
      intervalPlay = setInterval(() => {
        playTime = audio.currentTime + Number(app.noteSpeedInSec);
      }, 100);
    }
  }, 100);
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

function toggleControl() {
  app.showControl = !app.showControl;
}