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
    this.paused = true;

    // to check if keys should be combined
    this.lastAddedTime = null;
    this.lastAddedIdx = null;

    // clock for counting time
    this.intervalPlay = null;

    this.ytPlayer = new YoutubePlayer(vm);

    this.createTracks(4);

    this.registerInput();

    // start animate
    this.destoryed = false;
    this.update();
  }

  createTracks(trackNum) {
    // init play tracks
    this.dropTrackArr = [];

    this.trackNum = trackNum;
    this.trackKeyBind = this.getTrackKeyBind(trackNum);
    this.trackMaxWidth = 150;

    // init
    for (const keyBind of this.trackKeyBind) {
      this.dropTrackArr.push(
        new DropTrack(this.vm, this, 0, this.trackMaxWidth, keyBind)
      );
    }

    this.reposition();
  }

  getTrackKeyBind(trackNum) {
    switch (trackNum) {
      case 4:
        return ["d", "f", "j", "k"];
      case 5:
        return ["d", "f", " ", "j", "k"];
      case 6:
        return ["s", "d", "f", "j", "k", "l"];
      case 7:
        return ["s", "d", "f", " ", "j", "k", "l"];
      case 8:
        return ["a", "s", "d", "f", "j", "k", "l", ";"];
      default:
        return ["d", "f", "j", "k"];
    }
  }

  reposition() {
    if (this.vm.wrapper) {
      this.canvas.style.height = this.vm.contentHeight ?? "100%";
      this.canvas.width = this.vm.wrapper.clientWidth;
      this.canvas.height = this.vm.wrapper.clientHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
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
      this.dropTrackArr[counter].updateHitGradient();
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
    if (!this.vm.playMode && !this.paused) {
      const cTime = await this.getCurrentTime();
      if (this.trackKeyBind.includes(key)) {
        // this.timeArr.push({ t: cTime.toFixed(3), k: key });
        // this.timeArrIdx = this.timeArr.length - 1;
        if (this.lastAddedTime && cTime - this.lastAddedTime < 0.05) {
          this.timeArr[this.lastAddedIdx].k += key;
        } else {
          // add at idx
          this.timeArr.splice(this.timeArrIdx, 0, {
            t: cTime.toFixed(3),
            k: key,
          });
          this.lastAddedTime = cTime;
          this.lastAddedIdx = this.timeArrIdx;
        }
      }
    }
    this.registerKeyDown(key);
  }

  registerKeyDown(key, colorOverride) {
    for (const track of this.dropTrackArr) {
      track.keyDown(key, colorOverride);
    }
  }

  // animate all
  update() {
    if (this.destoryed) return;
    requestAnimationFrame(this.update.bind(this));
    if (this.vm.started && this.paused && this.vm.playMode) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.vm.visualizerInstance.renderVisualizer();
    let shouldAdvance = [];
    for (const track of this.dropTrackArr) {
      shouldAdvance.push(track.update());
    }
    if (shouldAdvance.some((e) => e === true)) this.timeArrIdx++;
  }

  startSong() {
    this.resetPlaying();
    const startTime = Date.now();
    window.focus();

    const intervalPrePlay = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      this.playTime = Number(elapsedTime / 1000);
      if (this.playTime > Number(this.vm.noteSpeedInSec)) {
        if (!this.vm.started || !this.paused) this.resumeGame();
        // this.vm.visualizerInstance.initAllVisualizersIfRequried();
        clearInterval(intervalPrePlay);
        clearInterval(this.intervalPlay);
        this.vm.started = true;
        this.intervalPlay = setInterval(async () => {
          const cTime = await this.getCurrentTime();
          this.playTime = cTime + Number(this.vm.noteSpeedInSec);
          const lastIdx = this.timeArr.length - 1;
          // advance time arr idx if it's behind current play time
          if (this.vm.inEditor && !this.vm.playMode && !this.paused) {
            const lastIdx = this.timeArrIdx;
            let idx = this.timeArr.findIndex((e) => e.t >= cTime);
            if (idx === -1) {
              const endIdx = this.timeArr.length - 1;
              idx =
                this.timeArr[endIdx] && this.timeArr[endIdx].t < cTime
                  ? endIdx + 1
                  : 0;
            }
            this.timeArrIdx = idx;
            if (
              this.vm.showExistingNote &&
              lastIdx !== idx &&
              this.timeArr[idx]
            )
              this.registerKeyDown(this.timeArr[idx].k, "grey");
          }
          // check game end
          if (
            !this.vm.inEditor &&
            this.vm.playMode &&
            this.timeArrIdx >= lastIdx &&
            this.timeArr[lastIdx] &&
            this.playTime > this.timeArr[lastIdx].t + 5
          ) {
            this.vm.gameEnded();
          }
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
    this.audio.stop();
  }

  loadSong(song) {
    this.loading = true;
    this.resetPlaying(true);
    this.vm.currentSong = song;
    this.vm.srcMode = song.srcMode;
    this.timeArr = song.sheet;
    this.vm.visualizerInstance.vComponent =
      song.visualizerName !== null ? song.visualizerName : 0;
    if (song.keys && song.keys != 4) this.createTracks(Number(song.keys));
    if (song.srcMode === "youtube") {
      this.ytPlayer.loadYoutubeVideo(song.youtubeId);
    } else if (song.srcMode === "url") {
      this.vm.audio.loadSong(
        song.url,
        false,
        this.vm.songLoaded,
        this.vm.gameEnded
      );
    }
  }

  destroyInstance() {
    this.destoryed = true;
    this.resetPlaying();
  }

  pauseGame() {
    this.paused = true;
    if (this.vm.srcMode === "url") {
      return this.audio.pause();
    } else if (this.vm.srcMode === "youtube") {
      return this.ytPlayer.pauseVideo();
    }
  }

  resumeGame() {
    this.paused = false;
    this.reposition();
    if (this.vm.srcMode === "url") {
      this.audio.play();
    } else if (this.vm.srcMode === "youtube") {
      this.ytPlayer.playVideo();
    }
  }
}
