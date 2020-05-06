// audio.crossOrigin = "anonymous";
let audioCtx;
let src;
let analyser;
let bufferLength;
let dataArray;

function initVisualizerData() {
  audioCtx = new AudioContext();
  src = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();

  src.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;

  bufferLength = analyser.frequencyBinCount;

  dataArray = new Uint8Array(bufferLength);
}

function initAllVisualizersIfRequried() {
  if (!audioCtx) {
    initVisualizerData();
    initSpaceVisualizer();
    visualizerLoaded = true;
  }
}

let barHeight;
let barX = 0;

function renderBarVisualizer() {
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const barWidth = (WIDTH / bufferLength) * 2.5;
  barX = 0;

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 3;

    const r = (barX / WIDTH) * 255;
    const g = 50 * (i / bufferLength);
    const b = barHeight + 10 * (i / bufferLength);

    let temp = 0;
    const transValue = 10;
    if (barHeight != 0) {
      for (let j = 0; j <= barHeight; j += transValue) {
        temp += 1 / (barHeight / 50) / 2;
        ctx.fillStyle = `rgba(${r},${g},${b},${temp})`;
        ctx.fillRect(
          barX,
          HEIGHT - barHeight + j + 10,
          barWidth,
          barHeight / transValue
        );
      }
      barX += barWidth;
    }
  }
}
