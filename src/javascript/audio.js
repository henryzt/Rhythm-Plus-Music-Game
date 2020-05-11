import { Howl, Howler } from "howler";

export default class Audio {
  constructor() {
    this.audioData = {
      audioCtx: null,
      analyser: null,
      bufferLength: null,
      dataArray: null,
    };
    this.player = null;
  }

  async loadSong(songSrc, asBackground) {
    if (this.player) this.player.unload();

    this.player = new Howl({
      src: [songSrc],
      loop: asBackground,
    });

    // ref https://stackoverflow.com/questions/32460123/connect-analyzer-to-howler-sound

    // Create an analyser node in the Howler WebAudio context
    let analyser = Howler.ctx.createAnalyser();

    // Connect the masterGain -> analyser (disconnecting masterGain -> destination)
    Howler.masterGain.connect(analyser);

    analyser.fftSize = 256;

    this.audioData.bufferLength = analyser.frequencyBinCount;

    this.audioData.dataArray = new Uint8Array(this.audioData.bufferLength);

    this.audioData.analyser = analyser;
    this.audioData.audioCtx = Howler.ctx;

    if (asBackground) this.player.play();
  }

  stop() {
    if (this.player) this.player.stop();
  }

  pause() {
    if (this.player) this.player.pause();
  }

  play() {
    if (this.player) {
      this.player.pause();
      this.player.play();
    }
  }

  getCurrentTime() {
    return this.player ? this.player.seek() : 0;
  }

  seek(sec) {
    if (this.player) this.player.seek(sec);
  }
}
