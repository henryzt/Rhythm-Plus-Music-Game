window.onload = function() {
  audio.crossOrigin = "anonymous";
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();

  var visualizerCanvas = document.getElementById("visualizer");
  visualizerCanvas.width = window.innerWidth;
  visualizerCanvas.height = window.innerHeight;
  var vCtx = visualizerCanvas.getContext("2d");

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

  var bufferLength = analyser.frequencyBinCount;

  var dataArray = new Uint8Array(bufferLength);

  var WIDTH = visualizerCanvas.width;
  var HEIGHT = visualizerCanvas.height;

  var barWidth = (WIDTH / bufferLength) * 2.5;
  var barHeight;
  var x = 0;

  function renderFrame() {
    requestAnimationFrame(renderFrame);

    x = 0;

    analyser.getByteFrequencyData(dataArray);

    vCtx.fillStyle = "#000";
    vCtx.fillRect(0, 0, WIDTH, HEIGHT);

    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * 3;

      var r = (x / WIDTH) * 255;
      var g = 50 * (i / bufferLength);
      var b = barHeight + 10 * (i / bufferLength);

      var temp = 0;
      const transValue = 100;
      if (barHeight != 0) {
        for (var j = 0; j <= barHeight; j += 2) {
          temp += 1 / barHeight / 2;
          vCtx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + temp + ")";
          vCtx.fillRect(x, HEIGHT - barHeight + j + 10, barWidth, barHeight / transValue);
        }
        x += barWidth;
      }
    }
  }

  renderFrame();
};
