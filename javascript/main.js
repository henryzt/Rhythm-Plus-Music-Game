let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dropTrackArr = [];

let timeArr = [];
let timeArrIdx = 0;

let playTime = 0;

//hit indicator gradient
let hitGradient = ctx.createLinearGradient(0, (canvas.height / 10) * 8, 0, canvas.height);
hitGradient.addColorStop(0, "rgba(0,0,0,0)");
hitGradient.addColorStop(1, "yellow");

let checkHitLineY = (canvas.height / 10) * 9;

//note speed
let noteSpeedInSec = 2;
let noteSpeedPxPerSec = checkHitLineY / noteSpeedInSec;

//vue app
let app = new Vue({
  el: "#app",
  data: {
    playMode: false,
    mode: this.playMode ? "Play Mode" : "Create Mode",
    speed: noteSpeedInSec,
    currentSong: "",
    loadFrom: "",
    saveTo: ""
  },
  mounted: function() {
    this.$watch("currentSong", () => {
      this.$refs.audioElement.load();
    });
  }
});

let audio = app.$refs.audioElement;

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

let trackNum = 4;
let trackMaxWidth = 150;

// init tracks
for (keyBind of ["d", "f", "j", "k"]) {
  dropTrackArr.push(new dropTrack(0, trackMaxWidth, keyBind));
}
reposition();

window.addEventListener("resize", function(event) {
  console.log("resize");
  reposition();
});

function reposition() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let trackWidth = canvas.width / 4 > trackMaxWidth ? trackMaxWidth : canvas.width / 4;
  let startX = canvas.width / 2 - (trackNum * trackWidth) / 2;
  let counter = 0;
  for (track of dropTrackArr) {
    dropTrackArr[counter].resizeTrack(startX + trackWidth * counter + counter, trackWidth);
    counter++;
  }

  checkHitLineY = (canvas.height / 10) * 9;
  noteSpeedPxPerSec = checkHitLineY / noteSpeedInSec;
}

function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (track of dropTrackArr) {
    track.update();
  }
}

animate();

function playGame() {
  timeArrIdx = 0;
  audio.currentTime = 0;
  let startTime = Date.now();
  app.playMode = true;

  let intervalPlay = null;
  let intervalPrePlay = setInterval(function() {
    let elapsedTime = Date.now() - startTime;
    playTime = Number(elapsedTime / 1000);
    if (playTime > noteSpeedInSec) {
      audio.play();
      clearInterval(intervalPrePlay);
      intervalPlay = setInterval(() => {
        playTime = audio.currentTime + noteSpeedInSec;
      }, 1);
    }
  }, 100);
}
