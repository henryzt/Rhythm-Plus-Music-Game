import { Howl, Howler } from "howler";
const assetsBaseUrl = "https://assets.rhythm-plus.com/bgm/";

export default class Audio {
  constructor() {
    this.audioData = {
      audioCtx: null,
      analyser: null,
      bufferLength: null,
      dataArray: null,
    };
    this.maxVolume = 0.7;
    this.player = null;
    this.muteBg = false;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else if (this.asBackground) {
        this.play();
      }
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
    this.asBackground = asBackground;

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
      Logger.log("Audio loaded");
    });
    this.player.on("end", () => {
      if (finishedCallback) finishedCallback();
      if (asBackground) this.playBgm(this.player._src);
    });
    this.player.on("loaderror", () => {
      if (errorCallback) errorCallback();
    });
  }

  playBgm(songToExclude) {
    // randomly play background music
    let bgmUrlArr = [
      assetsBaseUrl + "aurora.mp3",
      assetsBaseUrl + "beyond.mp3",
      // assetsBaseUrl + "machinery.mp3",
    ];
    if (songToExclude && !bgmUrlArr.includes(songToExclude)) return; // is playing result bgm
    shuffle(bgmUrlArr);
    bgmUrlArr.filter((e) => e !== songToExclude);
    this.stop();
    Logger.log(bgmUrlArr);
    this.loadSong(bgmUrlArr[0], true);
  }

  playEffect(name) {
    // 2nd param: override
    const url = `/audio/effects/${name}.mp3`;
    const effectPlayer = new Howl({
      volume: 0.5,
      src: [url],
      loop: false,
    });
    effectPlayer.play();
  }

  playHoverEffect(name) {
    if (window.innerWidth > 1000) this.playEffect(name);
  }

  stop(stopBackground) {
    if (!stopBackground && this.asBackground) return;
    Logger.warn("stop", this.player, this.asBackground);
    this.player?.stop();
    if (this.asBackground) {
      this.player?.unload();
      this.player = null;
    }
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

function shuffle(array) {
  //ref https://stackoverflow.com/questions/2450954/

  let currentIndex = array.length;
  let randomIndex = 0;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
