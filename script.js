var audio = document.getElementById("audio-element");

var canvas = document.querySelector("canvas");

var ctx = this.canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let arr = [];
console.log(audio.currentTime);

window.onload = function() {
  document.addEventListener(
    "keydown",
    function(event) {
      console.log(audio.currentTime, event.key);
      arr.push({ time: audio.currentTime, key: event.key });
    },
    false
  );
};

function dropTrack(x, width, keyBind) {
  this.x = x;
  this.width = width;
  this.keyBind = keyBind;

  this.update = function() {
    ctx.fillStyle = "#212121";
    ctx.fillRect(x, 0, width, canvas.height);
  };
}

let trackNum = 4;
let trackWidth = 150;

let startX = canvas.width / 2 - (trackNum * trackWidth) / 2;
let dropTrackArr = [];
dropTrackArr.push(new dropTrack(startX + trackWidth * 0, trackWidth, "d"));
dropTrackArr.push(new dropTrack(startX + trackWidth * 1 + 2, trackWidth, "f"));
dropTrackArr.push(new dropTrack(startX + trackWidth * 2 + 4, trackWidth, "j"));
dropTrackArr.push(new dropTrack(startX + trackWidth * 3 + 6, trackWidth, "k"));

function animate() {
  requestAnimationFrame(animate);
  for (track of dropTrackArr) {
    track.update();
  }
}

animate();
