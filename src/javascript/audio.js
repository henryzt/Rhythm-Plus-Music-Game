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
    document.addEventListener("visibilitychange", () => {
      if (this.player) this.mute(document.hidden);
    });
  }

  async loadSong(songSrc, asBackground, loadedCallback) {
    this.player?.unload();

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

    this.player.on("load", () => {
      if (loadedCallback) loadedCallback();
      console.log("Audio loaded");
    });
  }

  stop() {
    this.player?.stop();
  }

  pause() {
    this.player?.pause();
  }

  play() {
    this.player?.pause();
    this.player?.play();
  }

  mute(mute) {
    if (mute) this.player.fade(1, 0, 500);
    else this.player.fade(0, 1, 2000);
  }

  getCurrentTime() {
    return this.player ? this.player.seek() : 0;
  }

  seek(sec) {
    this.player?.seek(sec);
  }
}
