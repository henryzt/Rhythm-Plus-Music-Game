let audio = document.getElementById("audio-element");

let canvas = document.querySelector("canvas");

let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dropTrackArr = [];

let timeArr = [];
console.log(audio.currentTime);

window.onload = function() {
  document.addEventListener(
    "keydown",
    function(event) {
      console.log(audio.currentTime, event.key);
      timeArr.push({ time: audio.currentTime, key: event.key });
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
      this.noteArr.push(new Note(this.x, this.width));
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
    for (note of this.noteArr) {
      note.update();
      //   if(note.isOutOfCanvas()){

      //   }
    }
    //hit indicator
    if (this.hitIndicatorOpacity > 0) {
      ctx.fillStyle = hitGradient;
      ctx.globalAlpha = this.hitIndicatorOpacity;
      ctx.fillRect(x, (canvas.height / 10) * 8, this.width, (canvas.height / 10) * 2);
      this.hitIndicatorOpacity -= 0.01;
      ctx.globalAlpha = 1;
    }
  };
}

let noteSpeed = 5;

function Note(x, width) {
  this.x = x;
  this.width = width;

  this.y = 0;

  this.getScore = function() {
    return checkHitLineY - this.y;
  };

  this.isOutOfCanvas = function() {
    return this.y > canvas.height;
  };

  this.update = function() {
    let color = this.y > checkHitLineY + 10 ? "red" : "yellow";
    ctx.fillStyle = color;
    ctx.fillRect(x, this.y, this.width, 10);
    this.y += noteSpeed;
  };
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
