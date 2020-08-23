import DropTrack from "./track";
import FeverEffect from "./FeverEffect";
import YoutubePlayer from "./youtube";

const KeyCode = {
  KEY_LEFT: 37,
  KEY_RIGHT: 39,
  ESC: 27,
  P: 80,
};

export default class GameInstance {
  constructor(vm) {
    this.canvas = vm.canvas;
    this.ctx = vm.ctx;
    this.audio = vm.audio;
    this.vm = vm;

    this.timeArr = [];
    this.timeArrIdx = 0;

    // time elapsed relative to audio play time (+Number(noteDelay))
    this.currentTime = 0;
    this.playTime = 0; // Current time + note drop delay
    this.startSongAt = 0;
    this.loading = false;
    this.paused = true;

    // to check if keys should be combined
    this.lastAddedTime = null;
    this.lastAddedIdx = null;

    // clock for counting time
    this.intervalPlay = null;

    // if eidtor slider is dragging, override play time
    this.seekingTime = null;

    // store whether key is holding
    this.keyHoldingStatus = {};

    // store holding key
    this.holdingNote = {};

    // timeouts for holding note
    this.holdingNoteTimeout = {};

    // white line checking note hit
    this.checkHitLineY = 0;
    this.noteSpeedPxPerSec = 0;

    this.ytPlayer = new YoutubePlayer(vm);
    this.feverEff = new FeverEffect(vm, this);

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

  async reposition() {
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

    this.startX = startX;
    this.endX = startX + (trackWidth + 1) * this.dropTrackArr.length - 1;

    const isMobile = window.innerWidth < 1000;
    let hitLineProp = isMobile ? 8.5 : 9;
    if (!this.vm.playMode) hitLineProp = this.vm.options.lowerHitLine ? 4 : 0;

    this.checkHitLineY = (this.canvas.height / 10) * hitLineProp;
    this.noteSpeedPxPerSec = 380 * this.vm.noteSpeed * this.vm.playbackSpeed;
    this.noteDelay =
      (this.checkHitLineY / this.noteSpeedPxPerSec) * this.vm.playbackSpeed;
    await this.updateCurrentTime();
    this.repositionNotes();
    Logger.log("Repositioned");
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
        this.onKeyDown(event.key.toLowerCase());
        if (event.keyCode === KeyCode.ESC || event.keyCode === KeyCode.P) {
          if (!this.vm.started) return;
          if (this.paused) {
            this.vm.resumeGame(true);
          } else {
            this.vm.pauseGame();
          }
        }
        if (this.vm.inEditor) {
          // editor time minor adjust by arrow keys
          if (event.keyCode === KeyCode.KEY_LEFT) {
            this.vm.seekTo(this.currentTime - 0.03);
          } else if (event.keyCode === KeyCode.KEY_RIGHT) {
            this.vm.seekTo(this.currentTime + 0.03);
          }
        }
      },
      false
    );

    document.addEventListener(
      "keyup",
      (event) => {
        this.onKeyUp(event.key.toLowerCase());
      },
      false
    );

    let touches = {};

    const tapEvent = (e, start) => {
      e.preventDefault();
      for (let pointer of e.changedTouches) {
        const x = pointer.clientX;

        this.dropTrackArr.forEach((track) => {
          if (x > track.x && x < track.x + track.width) {
            if (start) {
              this.onKeyDown(track.keyBind);
              touches[pointer.identifier] = track.keyBind;
            } else {
              this.onKeyUp(track.keyBind);
              touches[pointer.identifier] = null;
            }
          }
        });
      }
    };

    const moveEvent = (e) => {
      for (let pointer of e.changedTouches) {
        const x = pointer.clientX;
        if (!touches[pointer.identifier]) return;

        this.dropTrackArr.forEach((track) => {
          if (x > track.x && x < track.x + track.width) {
            if (touches[pointer.identifier] !== track.keyBind) {
              this.onKeyUp(touches[pointer.identifier]);
              touches[pointer.identifier] = null;
            }
          }
        });
      }
    };

    this.canvas.ontouchstart = (e) => {
      tapEvent(e, true);
    };
    this.canvas.ontouchmove = moveEvent;
    this.canvas.ontouchcancel = (e) => {
      tapEvent(e, false);
    };
    this.canvas.ontouchend = (e) => {
      tapEvent(e, false);
    };
  }

  // log key and touch events
  async onKeyDown(key) {
    // avoid repeated triggering when key is held
    if (this.keyHoldingStatus[key]) return;
    this.keyHoldingStatus[key] = true;
    if (!this.trackKeyBind.includes(key)) return;
    // if in create mode, create note
    if (!this.vm.playMode && !this.paused) {
      await this.updateCurrentTime();
      this.createSingleNote(key, this.currentTime);
      const singleNoteObj = this.timeArr[this.lastAddedIdx];
      // convert to hold note
      this.holdingNoteTimeout[key] = setTimeout(() => {
        if (this.keyHoldingStatus[key]) {
          this.createHoldNote(key, singleNoteObj);
        }
        this.holdingNoteTimeout[key] = null;
      }, 300);
    }
    // register key down
    for (const track of this.dropTrackArr) {
      track.keyDown(key);
    }
  }

  async onKeyUp(key) {
    this.keyHoldingStatus[key] = false;
    clearTimeout(this.holdingNoteTimeout[key]);
    if (this.holdingNote[key]) {
      await this.updateCurrentTime();
      this.holdingNote[key].h[key] = this.currentTime; // Hold note creation complete, set the end time
      this.holdingNote[key] = null; // set current holding key store to null
    }
    for (const track of this.dropTrackArr) {
      track.keyUp(key);
    }
  }

  dropNote(key, keyObj) {
    for (const track of this.dropTrackArr) {
      track.dropNote(key, keyObj);
    }
  }

  clearNotes() {
    for (const track of this.dropTrackArr) {
      track.noteArr = [];
    }
  }

  repositionNotes() {
    let filteredNotes = this.timeArr.filter((e) => {
      return this.isWithinTime(e);
    });
    for (const track of this.dropTrackArr) {
      track.repositionNotes(filteredNotes);
    }
    const idx = this.timeArr.findIndex(
      (e) => e === filteredNotes[filteredNotes.length - 1]
    );
    this.timeArrIdx = idx + 1;
  }

  createSingleNote(key, cTime) {
    const waitTimeForMultiNote = 0.05;
    // this.timeArr.push({ t: cTime.toFixed(3), k: key });
    // this.timeArrIdx = this.timeArr.length - 1;
    if (
      this.lastAddedTime &&
      this.timeArr[this.lastAddedIdx] &&
      this.lastAddedKey !== key &&
      cTime - this.lastAddedTime < waitTimeForMultiNote
    ) {
      this.timeArr[this.lastAddedIdx].k += key;
    } else {
      this.timeArr.push({
        t: Number(cTime.toFixed(3)),
        k: key,
      });
      // this.timeArrIdx = this.timeArr.length - 1;
      // add at idx
      // this.timeArr.splice(this.timeArrIdx, 0, {
      //   t: Number(cTime.toFixed(3)),
      //   k: key,
      // });
      this.lastAddedTime = cTime;
      this.lastAddedIdx = this.timeArr.length - 1;
      this.lastAddedKey = key;
      if (this.lastAddedIdx === this.timeArrIdx) this.timeArrIdx++;
      setTimeout(() => {
        if (!this.timeArr[this.lastAddedIdx]) return;
        const k = this.timeArr[this.lastAddedIdx].k;
        this.dropNote(k, this.timeArr[this.lastAddedIdx]);
      }, waitTimeForMultiNote * 1000 + 5);
    }
  }

  createHoldNote(key, obj) {
    Logger.log("hold", key, obj);
    obj.h = obj.h ?? {}; // key.hold = {key: endTime}
    obj.h[key] = -1; // -1: not yet completed
    this.holdingNote[key] = obj;
  }

  seekTo(time) {
    if (this.vm.srcMode === "youtube") {
      return this.vm.ytPlayer.seekTo(time);
    } else {
      return this.audio.seek(time);
    }
  }

  seeked() {
    // advance time arr idx if play time is changed
    if (this.vm.inEditor) {
      this.timeArrIdx = -1;
      const cTime = this.currentTime;
      let idx = this.timeArr.findIndex((e) => e.t >= cTime);
      if (idx === -1) {
        const endIdx = this.timeArr.length - 1;
        idx = this.timeArr[endIdx] ? endIdx + 1 : 0;
      }
      this.clearNotes();
      this.timeArrIdx = idx;
    }
  }

  // animate all
  update() {
    if (this.destoryed) return;
    requestAnimationFrame(this.update.bind(this));
    if (!this.vm.inEditor) this.updateCurrentTime();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.vm.visualizerInstance.renderVisualizer();
    this.feverEff.update();
    let shouldAdvance = false;
    for (const track of this.dropTrackArr) {
      shouldAdvance = track.update() || shouldAdvance;
    }
    if (shouldAdvance) this.timeArrIdx++;
    if (this.vm.perspective) this.drawFadeOut();
  }

  drawFadeOut() {
    this.ctx.globalCompositeOperation = "destination-out";
    let gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = "source-over";
  }

  startSong() {
    this.resetPlaying();
    const startTime = Date.now();
    window.focus();
    this.seekTo(this.startSongAt);
    this.reposition();
    const prePlayTime = this.noteDelay + this.startSongAt;

    const intervalPrePlay = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      this.playTime =
        (elapsedTime * this.vm.playbackSpeed) / 1000 + this.startSongAt;
      this.paused = false;
      if (this.seekingTime && this.seekingTime > this.startSongAt) {
        this.gameTimingLoop();
        this.seekTo(this.currentTime);
        this.seeked();
      }
      if (this.playTime > prePlayTime) {
        if (!this.vm.started || !this.paused) this.resumeGame(true);
        clearInterval(intervalPrePlay);
        clearInterval(this.intervalPlay);
        this.vm.started = true;
        this.intervalPlay = setInterval(this.gameTimingLoop.bind(this), 100);
      }
    }, 100);
  }

  async gameTimingLoop() {
    await this.updateCurrentTime();

    // check game end
    const gameEndAt = this.vm.currentSong.length;
    if (this.currentTime >= gameEndAt) {
      if (!this.vm.inEditor) {
        this.vm.gameEnded();
      } else if (!this.paused && this.vm.currentSong.endAt === gameEndAt) {
        this.vm.pauseGame();
        this.seekTo(gameEndAt);
        this.vm.$store.state.alert.info(
          `Game ended at ${gameEndAt} seconds`,
          3000
        );
      }
    }
  }

  async updateCurrentTime() {
    let cTime;
    if (this.seekingTime) {
      cTime = this.seekingTime;
    } else {
      cTime =
        this.vm.srcMode === "youtube"
          ? await this.ytPlayer.getPlayerTime()
          : this.audio.getCurrentTime();
      if (!this.vm.started) return cTime;
    }
    this.playTime = cTime + this.noteDelay;
    this.currentTime = cTime;
  }

  isWithinTime(note) {
    // check if a note with start time is currently on screen
    const time = note.t;
    const current = this.playTime;
    const afterHitLineSec =
      (this.canvas.height - this.checkHitLineY) / this.noteSpeedPxPerSec;
    const sec = this.noteDelay + afterHitLineSec;
    let isWithinStartTime = time >= current - sec;
    let isWithinEndTime = time <= current;
    if (note.h) {
      const holdTime = Math.max(...Object.values(note.h));
      isWithinStartTime = holdTime >= current - sec;
    }
    return isWithinStartTime && isWithinEndTime;
  }

  resetPlaying(resetTimeArr) {
    clearInterval(this.intervalPlay);
    this.vm.started = false;
    this.ytPlayer.resetVideo();
    this.clearNotes();
    if (resetTimeArr) this.timeArr = [];
    this.timeArrIdx = 0;
    this.playTime = this.startSongAt;
    this.currentTime = this.startSongAt;
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
    this.startSongAt = song.startAt ?? 0;
    if (song.keys && song.keys != 4) this.createTracks(Number(song.keys));
    if (song.srcMode === "youtube") {
      this.ytPlayer.loadYoutubeVideo(song.youtubeId);
    } else if (song.srcMode === "url") {
      this.vm.audio.loadSong(
        song.url,
        false,
        this.vm.songLoaded,
        this.vm.gameEnded,
        this.vm.ytError
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

  resumeGame(firstPlay) {
    if (!firstPlay && this.paused) this.reposition();
    this.paused = false;
    this.seekingTime = null;
    if (this.vm.srcMode === "url") {
      this.audio.play();
    } else if (this.vm.srcMode === "youtube") {
      this.ytPlayer.playVideo();
    }
  }
}
