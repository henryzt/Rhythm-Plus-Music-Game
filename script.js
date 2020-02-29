let audio = document.getElementById("audio-element");

let canvas = document.querySelector("canvas");

let playMode = false;

let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dropTrackArr = [];

let timeArr = [];
let timeArrIdx = 0;

let playTime = 0;

console.log(audio.currentTime);

window.onload = function() {
  document.addEventListener(
    "keydown",
    function(event) {
      if (!playMode) {
        console.log(audio.currentTime, event.key);
        timeArr.push({ time: audio.currentTime, key: event.key });
      }
      for (track of dropTrackArr) {
        track.keyDown(event.key);
      }
    },
    false
  );
};

//hit indicator gradient
let hitGradient = ctx.createLinearGradient(0, (canvas.height / 10) * 8, 0, canvas.height);
hitGradient.addColorStop(0, "rgba(0,0,0,0)");
hitGradient.addColorStop(1, "yellow");

let checkHitLineY = (canvas.height / 10) * 9;

function dropTrack(x, width, keyBind) {
  this.x = x;
  this.width = width;
  this.keyBind = keyBind;

  this.hitIndicatorOpacity = 0;
  this.noteArr = [];

  this.keyDown = function(key) {
    if (keyBind == key) {
      this.hitIndicatorOpacity = 1;
      if (!playMode) {
        this.noteArr.push(new Note(this.x, this.width));
      }
    }
  };

  this.update = function() {
    //track bg
    ctx.fillStyle = "#212121";
    ctx.fillRect(x, 0, width, canvas.height);
    //hit line
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, checkHitLineY, this.width, 10);
    //note update
    for (let i = 0; i < this.noteArr.length; ++i) {
      this.noteArr[i].update();
      if (this.noteArr[i].isOutOfCanvas()) {
        this.noteArr.splice(i, 1); // Remove out of canvas note
        --i; // Correct the index value
      }
    }
    //hit indicator
    if (this.hitIndicatorOpacity > 0) {
      ctx.fillStyle = hitGradient;
      ctx.globalAlpha = this.hitIndicatorOpacity;
      ctx.fillRect(x, (canvas.height / 10) * 8, this.width, (canvas.height / 10) * 2);
      this.hitIndicatorOpacity -= 0.01;
      ctx.globalAlpha = 1;
    }

    //create note
    let needNote =
      playMode &&
      timeArrIdx < timeArr.length &&
      playTime >= timeArr[timeArrIdx].time &&
      timeArr[timeArrIdx].key == keyBind;

    if (needNote) {
      console.log(playTime);
      this.noteArr.push(new Note(this.x, this.width));
      timeArrIdx++;
    }
  };
}

let noteSpeedInSec = 4;
let noteSpeedPxPerSec = checkHitLineY / noteSpeedInSec;

function Note(x, width) {
  this.x = x;
  this.width = width;

  this.y = 0;

  // modulate speed, ref https://www.viget.com/articles/time-based-animation/
  this.now = Date.now();
  this.delta = 0;
  this.then = 0;

  this.setDelta = function() {
    if (this.then == 0) this.then = this.now;
    this.now = Date.now();
    this.delta = (parseFloat(this.now) - parseFloat(this.then)) / 1000; // seconds since last frame
    this.then = this.now;
  };

  this.getScore = function() {
    return checkHitLineY - this.y;
  };

  this.isOutOfCanvas = function() {
    return this.y > canvas.height;
  };

  this.update = function() {
    this.setDelta();
    let color = this.y > checkHitLineY + 10 ? "red" : "yellow";
    ctx.fillStyle = color;
    ctx.fillRect(x, this.y, this.width, 10);
    this.y += noteSpeedPxPerSec * this.delta;
  };
}

function saveToLocal(name) {
  let local = localStorage.getItem("localTimeline") || {};
  local[name] = { timeline: timeArr };
  localStorage.setItem("localTimeline", local);
}

function loadFromLocal(name) {
  let local = localStorage.getItem("localTimeline");
  if (local && local[name]) {
    timeArr = local[name].timeline;
  }
}

let trackNum = 4;
let trackWidth = 150;

let startX = canvas.width / 2 - (trackNum * trackWidth) / 2;

dropTrackArr.push(new dropTrack(startX + trackWidth * 0, trackWidth, "d"));
dropTrackArr.push(new dropTrack(startX + trackWidth * 1 + 2, trackWidth, "f"));
dropTrackArr.push(new dropTrack(startX + trackWidth * 2 + 4, trackWidth, "j"));
dropTrackArr.push(new dropTrack(startX + trackWidth * 3 + 6, trackWidth, "k"));

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
  playMode = true;

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
