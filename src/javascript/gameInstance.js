import DropTrack from "./track";
import YoutubePlayer from "./youtube";
import ZingTouch from "zingtouch";

export default class GameInstance {
  constructor(vm) {
    this.canvas = vm.canvas;
    this.ctx = vm.ctx;
    this.audio = vm.audio;
    this.vm = vm;

    this.timeArr = [];
    this.timeArrIdx = 0;

    // time elapsed relative to audio play time (+Number(vm.noteSpeedInSec))
    this.playTime = 0;
    this.loading = false;
    this.paused = false;

    // init play tracks
    this.dropTrackArr = [];

    this.trackNum = 4;
    this.trackKeyBind = ["d", "f", "j", "k"];
    this.trackMaxWidth = 150;

    // clock for counting time
    this.intervalPlay = null;

    this.ytPlayer = new YoutubePlayer(vm);

    // init

    for (const keyBind of this.trackKeyBind) {
      this.dropTrackArr.push(
        new DropTrack(vm, this, 0, this.trackMaxWidth, keyBind)
      );
    }

    this.reposition();

    this.registerInput();

    // start animate
    this.destoryed = false;
    this.update();
  }

  reposition() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const trackWidth =
      this.canvas.width / this.trackNum > this.trackMaxWidth
        ? this.trackMaxWidth
        : this.canvas.width / this.trackNum;
    const startX = this.canvas.width / 2 - (this.trackNum * trackWidth) / 2;

    for (let counter = 0; counter < this.dropTrackArr.length; counter++) {
      const trackWidthWithOffset = trackWidth + 1;
      this.dropTrackArr[counter].resizeTrack(
        startX + trackWidthWithOffset * counter,
        trackWidth
      );
    }

    this.vm.checkHitLineY = (this.canvas.height / 10) * 9;
    this.vm.noteSpeedPxPerSec =
      this.vm.checkHitLineY / Number(this.vm.noteSpeedInSec);
  }

  registerInput() {
    window.addEventListener("resize", (_) => {
      this.reposition();
    });

    window.addEventListener(
      "orientationchange",
      (_) => {
        this.reposition();
      },
      false
    );

    document.addEventListener(
      "keydown",
      (event) => {
        this.onKeyDown(event.key);
      },
      false
    );

    const tapEvent = (e) => {
      for (let pointer of e.detail.events) {
        const x = pointer.clientX;

        this.dropTrackArr.forEach((track) => {
          if (x > track.x && x < track.x + track.width) {
            this.onKeyDown(track.keyBind);
          }
        });
      }
    };

    this.touchRegion = ZingTouch.Region(this.canvas);

    for (let numInputs of [1, 2, 3, 4]) {
      this.touchRegion.bind(
        this.canvas,
        new ZingTouch.Tap({ numInputs }),
        tapEvent
      );
    }
  }

  // log key and touch events
  async onKeyDown(key) {
    if (!this.vm.playMode) {
      const cTime = await this.getCurrentTime();
      if (this.trackKeyBind.includes(key))
        this.timeArr.push({ time: cTime, key });
    }
    for (const track of this.dropTrackArr) {
      track.keyDown(key);
    }
  }

  // animate all
  update() {
    if (this.destoryed) return;
    requestAnimationFrame(this.update.bind(this));
    if (this.paused) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.vm.visualizerInstance.renderVisualizer();
    for (const track of this.dropTrackArr) {
      track.update();
    }
  }

  startSong() {
    this.resetPlaying();
    const startTime = Date.now();
    this.vm.playMode = true;
    window.focus();

    const intervalPrePlay = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      this.playTime = Number(elapsedTime / 1000);
      if (this.playTime > Number(this.vm.noteSpeedInSec)) {
        if (!this.paused) this.resumeGame();
        // this.vm.visualizerInstance.initAllVisualizersIfRequried();
        clearInterval(intervalPrePlay);
        this.vm.started = true;
        this.intervalPlay = setInterval(async () => {
          const cTime = await this.getCurrentTime();
          this.playTime = cTime + Number(this.vm.noteSpeedInSec);
        }, 100);
      }
    }, 100);
  }

  getCurrentTime() {
    // it seems that 'getPlayerTime' is async, thus all places calling this func need to await res [help wanted]
    return this.vm.srcMode === "youtube"
      ? this.ytPlayer.getPlayerTime()
      : this.audio.getCurrentTime();
  }

  resetPlaying(resetTimeArr) {
    clearInterval(this.intervalPlay);
    this.ytPlayer.resetVideo();
    if (resetTimeArr) this.timeArr = [];
    this.timeArrIdx = 0;
    this.playTime = 0;
    this.vm.playMode = false;
    this.audio.stop();
  }

  loadSong(song) {
    this.loading = true;
    this.resetPlaying(true);
    this.vm.currentSong = song.url;
    this.vm.srcMode = song.srcMode;
    this.timeArr = song.sheet;
    this.vm.visualizerInstance.visualizer =
      song.visualizerNo !== null ? song.visualizerNo : 0;
    if (song.srcMode === "youtube") {
      this.ytPlayer.loadYoutubeVideo(song.youtubeId);
    }
  }

  destroyInstance() {
    this.destoryed = true;
    this.resetPlaying();
  }

  pauseGame() {
    this.paused = true;
    if (this.vm.srcMode === "url") {
      this.audio.pause();
    } else if (this.vm.srcMode === "youtube") {
      this.ytPlayer.pauseVideo();
    }
  }

  resumeGame() {
    this.paused = false;
    if (this.vm.srcMode === "url") {
      this.audio.play();
    } else if (this.vm.srcMode === "youtube") {
      this.ytPlayer.playVideo();
    }
  }
}
