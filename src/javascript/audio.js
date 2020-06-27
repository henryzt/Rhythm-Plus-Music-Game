import { Howl, Howler } from "howler";

export default class Audio {
  constructor() {
    this.audioData = {
      audioCtx: null,
      analyser: null,
      bufferLength: null,
      dataArray: null,
    };
    this.maxVolume = 0.3;
    this.player = null;
    this.muteBg = false;
    document.addEventListener("visibilitychange", () => {
      if (this.player && !this.muteBg) this.mute(document.hidden);
    });
  }

  async loadSong(
    songSrc,
    asBackground,
    loadedCallback,
    finishedCallback,
    errorCallback
  ) {
    this.player?.unload();

    this.player = new Howl({
      volume: this.muteBg && asBackground ? 0 : this.maxVolume,
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
    this.player.on("end", () => {
      if (finishedCallback) finishedCallback();
    });
    this.player.on("loaderror", () => {
      if (errorCallback) errorCallback();
    });
  }

  playBgm() {
    // randomly play background music
    const bgmUrlArr = ["/audio/bgm/aurora.mp3", "/audio/bgm/kontekst.mp3"];
    const bgmUrl = bgmUrlArr[Math.floor(Math.random() * bgmUrlArr.length)];
    // if (bgmUrl == this.player?._src) return;
    if (this.player) return;
    this.stop();
    this.loadSong(bgmUrl, true);
  }

  playEffect(url) {
    const effectPlayer = new Howl({
      volume: 0.5,
      src: [url],
      loop: false,
    });
    effectPlayer.play();
  }

  stop() {
    this.player?.stop();
    this.player?.unload();
    this.player = null;
  }

  pause() {
    this.player?.pause();
  }

  play() {
    this.player?.pause();
    this.player?.play();
  }

  mute(mute) {
    if (mute) this.player.fade(this.maxVolume, 0, 500);
    else this.player.fade(0, this.maxVolume, 2000);
  }

  toggleBgMute() {
    this.muteBg = !this.muteBg;
    this.mute(this.muteBg);
  }

  getCurrentTime() {
    return this.player ? this.player.seek() : 0;
  }

  seek(sec) {
    this.player?.seek(sec);
  }

  getDuration() {
    return this.player?.duration();
  }

  setRate(rate) {
    this.player?.rate(rate);
  }
}
