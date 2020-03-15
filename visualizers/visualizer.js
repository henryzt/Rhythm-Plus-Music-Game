audio.crossOrigin = "anonymous";
let context = new AudioContext();
let src = context.createMediaElementSource(audio);
let analyser = context.createAnalyser();

src.connect(analyser);
analyser.connect(context.destination);

analyser.fftSize = 256;

let bufferLength = analyser.frequencyBinCount;

let dataArray = new Uint8Array(bufferLength);

let WIDTH = canvas.width;
let HEIGHT = canvas.height;

let barWidth = (WIDTH / bufferLength) * 2.5;
let barHeight;
let x = 0;

function renderVisualizerFrame() {
  // requestAnimationFrame(renderFrame);

  x = 0;

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 3;

    let r = (x / WIDTH) * 255;
    let g = 50 * (i / bufferLength);
    let b = barHeight + 10 * (i / bufferLength);

    let temp = 0;
    const transValue = 10;
    if (barHeight != 0) {
      for (let j = 0; j <= barHeight; j += transValue) {
        temp += 1 / (barHeight / 50) / 2;
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + temp + ")";
        ctx.fillRect(x, HEIGHT - barHeight + j + 10, barWidth, barHeight / transValue);
      }
      x += barWidth;
    }
  }
}
