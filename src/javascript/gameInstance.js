import DropTrack from "./track";
import YoutubePlayer from "./youtube";
import { saveToLocal, loadFromLocal, loadFromDemo } from "./storage";

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
      this.dropTrackArr.push(new DropTrack(vm, this, 0, this.trackMaxWidth, keyBind));
    }

    this.reposition();

    this.registerInput();

    // start animate
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
    let counter = 0;
    for (const track of this.dropTrackArr) {
      this.dropTrackArr[counter].resizeTrack(startX + trackWidth * counter + counter, trackWidth);
      counter++;
    }

    this.vm.checkHitLineY = (this.canvas.height / 10) * 9;
    this.vm.noteSpeedPxPerSec = this.vm.checkHitLineY / Number(this.vm.noteSpeedInSec);
  }

  registerInput() {
    window.addEventListener("resize", (event) => {
      console.log("resize");
      this.reposition();
    });

    document.addEventListener(
      "keydown",
      (event) => {
        this.onKeyDown(event.key);
      },
      false
    );

    this.canvas.addEventListener(
      "touchstart",
      function (e) {
        for (let c = 0; c < e.changedTouches.length; c++) {
          // touchInf[e.changedTouches[c].identifier] = {"x":e.changedTouches[c].clientX,"y":e.changedTouches[c].clientY};
          const x = e.changedTouches[c].clientX;
          const y = e.changedTouches[c].clientY;

          this.dropTrackArr.forEach(function (track) {
            if (x > track.x && x < track.x + track.width) {
              this.onKeyDown(track.keyBind);
            }
          });
        }
      },
      false
    );
  }

  // log key and touch events
  async onKeyDown(key) {
    if (!this.vm.playMode) {
      const cTime = await this.getCurrentTime();
      console.log(cTime, key);
      if (this.trackKeyBind.includes(key)) this.timeArr.push({ time: cTime, key });
    }
    for (const track of this.dropTrackArr) {
      track.keyDown(key);
    }
  }

  // animate all
  update() {
    requestAnimationFrame(this.update.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.vm.visualizerInstance.renderVisualizer();
    for (const track of this.dropTrackArr) {
      track.update();
    }
  }

  playGame() {
    this.resetPlaying();
    const startTime = Date.now();
    this.vm.playMode = true;
    console.log(this.timeArr);

    const intervalPrePlay = setInterval(async () => {
      const elapsedTime = Date.now() - startTime;
      this.playTime = Number(elapsedTime / 1000);
      console.log(this.playTime, Number(this.vm.noteSpeedInSec));
      if (this.playTime > Number(this.vm.noteSpeedInSec)) {
        try {
          if (this.vm.srcMode == "url") {
            const res = await this.audio.play();
            console.log("audio playing", res, this.audio.canplay);
          } else if (this.vm.srcMode == "youtube") {
            this.ytPlayer.playVideo();
          }
        } catch (e) {
          console.error(e);
        }
        // this.vm.visualizerInstance.initAllVisualizersIfRequried();
        clearInterval(intervalPrePlay);
        this.intervalPlay = setInterval(async () => {
          const cTime = await this.getCurrentTime();
          this.playTime = cTime + Number(this.vm.noteSpeedInSec);
        }, 100);
      }
    }, 100);
  }

  getCurrentTime() {
    // it seems that 'getPlayerTime' is async, thus all places calling this func need to await res [help wanted]
    return this.vm.srcMode == "youtube" ? this.ytPlayer.getPlayerTime() : this.audio.currentTime;
  }

  resetPlaying(resetTimeArr) {
    clearInterval(this.intervalPlay);
    this.ytPlayer.resetVideo();
    if (resetTimeArr) this.timeArr = [];
    this.timeArrIdx = 0;
    this.playTime = 0;
    this.vm.playMode = false;
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  startSong(song) {
    this.resetPlaying(true);
    this.vm.currentSong = song.url;
    this.vm.srcMode = song.srcMode;
    this.timeArr = song.timeArr;
    this.vm.visualizer = song.visualizerNo ? song.visualizerNo : this.vm.visualizer;
    if (song.srcMode === "youtube") {
      this.loadYoutubeVideo(song.youtubeId);
    } else {
      this.audio.load();
    }
    this.playGame();
  }

  // local storage
  saveCurrentTimeArrToLocal(name) {
    saveToLocal(name, this.timeArr);
  }

  loadTimeArrFromLocal(name) {
    this.timeArr = loadFromLocal(name);
  }

  loadTimeArrFromDemo(name) {
    this.timeArr = loadFromDemo(name);
  }

  // youtube
  playVideo() {
    this.ytPlayer.playVideo();
  }

  loadYoutubeVideo(id) {
    this.ytPlayer.loadYoutubeVideo(id);
  }
}
