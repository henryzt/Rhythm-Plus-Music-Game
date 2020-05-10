// Fix iOS Audio Context by Blake Kus https://gist.github.com/kus/3f01d60569eeadefe3a1
// MIT license
export default function (audioContext) {
  var fixAudioContext = function () {
    if (audioContext) {
      //   console.log(audioContext);
      // Create empty buffer
      var buffer = audioContext.createBuffer(1, 1, 22050);
      var source = audioContext.createBufferSource();
      source.buffer = buffer;
      // Connect to output (speakers)
      source.connect(audioContext.destination);
      // Play sound
      if (source.start) {
        source.start(0);
      } else if (source.play) {
        source.play(0);
      } else if (source.noteOn) {
        source.noteOn(0);
      }

      if (audioContext.state === "running") {
        // Remove events
        document.removeEventListener("touchstart", fixAudioContext);
        document.removeEventListener("touchend", fixAudioContext);
        document.removeEventListener("mouseup", fixAudioContext);
      }
    }
  };
  // iOS 6-8
  document.addEventListener("touchstart", fixAudioContext);
  // iOS 9
  document.addEventListener("touchend", fixAudioContext);
  document.addEventListener("mouseup", fixAudioContext);
}
