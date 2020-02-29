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
      //   arr.push(`${audio.currentTime}:${event.key}`);
      arr.push({ time: audio.currentTime, key: event.key });
    },
    false
  );
};
