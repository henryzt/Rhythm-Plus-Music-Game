import DropTrack from "./track";
import { getPlayerTime, resetVideo, playVideo, loadYoutubeVideo } from "./youtube";
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
  onKeyDown(key) {
    if (!this.vm.playMode) {
      const cTime = this.getCurrentTime();
      console.log(cTime, key);
      this.timeArr.push({ time: cTime, key });
    }
    for (const track of this.dropTrackArr) {
      track.keyDown(key);
    }
  }

  // animate all
  update() {
    requestAnimationFrame(this.update.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderVisualizer();
    for (const track of this.dropTrackArr) {
      track.update();
    }
  }

  // render visualizer
  renderVisualizer() {
    if (!this.vm.visualizerLoaded) return;
    switch (this.vm.visualizer) {
      case 1:
        // renderSpaceVisualizer();
        break;
      case 2:
        // renderBarVisualizer();
        this.ctx.fillStyle = "rgba(10,10,44,0.2)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 3:
        // renderSpaceVisualizer(true);
        break;
      case 4:
        // renderSpaceVisualizer(true);
        break;
      default:
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  playGame() {
    const startTime = Date.now();
    this.vm.playMode = true;

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
            playVideo();
          }
        } catch (e) {
          console.error(e);
        }
        // initAllVisualizersIfRequried();
        clearInterval(intervalPrePlay);
        this.intervalPlay = setInterval(() => {
          this.playTime = this.getCurrentTime() + Number(this.vm.noteSpeedInSec);
        }, 100);
      }
    }, 100);
  }

  getCurrentTime() {
    return this.vm.srcMode == "youtube" ? getPlayerTime() : this.audio.currentTime;
  }

  resetPlaying() {
    clearInterval(this.intervalPlay);
    // resetVideo();
    this.timeArr = [];
    this.timeArrIdx = 0;
    this.playTime = 0;
    this.vm.playMode = false;
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  startSong(song) {
    this.resetPlaying();
    this.vm.currentSong = song.url;
    this.audio.load();
    this.timeArr = loadFromDemo(song.noteName);
    this.vm.visualizer = song.visualizerNo ? song.visualizerNo : this.vm.visualizer;
    this.playGame();
  }

  toggleControl() {
    this.vm.showControl = !this.vm.showControl;
  }

  toggleVisualizer() {
    this.vm.visualizer =
      this.vm.visualizer == this.visualizerArr.length - 1 ? 0 : this.vm.visualizer + 1;
  }
}
