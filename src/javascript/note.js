export default class Note {
  constructor(vm, game, keyObj, key, x, y = 0, width, color) {
    this.x = x;
    this.y = y; // drop from top (0) by default
    this.width = width;
    this.color = color;
    this.vm = vm;
    this.game = game;
    this.keyObj = keyObj;
    this.key = key;
    this.ctx = vm.ctx;
    this.canvas = vm.canvas;
    this.percentage = 0;
    this.isHoldNote = keyObj.h?.[key];
    this.isUserHolding = false;
    this.isHoldingDone = false;
    this.didUserHold = false;

    this.singleNoteHeight = 10;
    if (y !== 0) this.createdNote = true;

    // modulate speed, ref https://www.viget.com/articles/time-based-animation/
    this.now = Date.now();
    this.delta = 0;
    this.then = 0;
    this.timeStarted = this.now;
  }

  setDelta() {
    if (this.then === 0) this.then = this.now;
    this.now = Date.now();
    this.delta = (parseFloat(this.now) - parseFloat(this.then)) / 1000; // seconds since last frame
    this.then = this.now;
  }

  getDiffPercentage() {
    if (this.gameHadBeenPaused || this.vm.playbackSpeed !== 1) {
      // game had been pasued, time unuseable, use less accurate dist calculation instead
      const dist = this.game.checkHitLineY - this.y;
      const percentage = Math.abs(dist) / this.canvas.height; // the lower the better

      return percentage;
    } else {
      let hitTimeSinceStartInSec =
        (parseFloat(Date.now()) - parseFloat(this.timeStarted)) / 1000;
      const diff = Math.abs(this.game.noteDelay - hitTimeSinceStartInSec);
      let percentage = diff / this.game.noteDelay; // the lower the better

      return percentage;
    }
  }

  calculatePercent() {
    // FIXME calculation logic
    this.percentage = 1 - ((1 - this.getDiffPercentage() - 0.2) / 4) * 5;
    this.percentage = this.percentage < 1 ? this.percentage : 1;
  }

  judge() {
    if (this.percentage < 0.05) {
      this.vm.result.marks.perfect += 1;
      this.markJudge = "Perfect";
    } else if (this.percentage < 0.15) {
      this.vm.result.marks.good += 1;
      this.markJudge = "Good";
    } else if (this.percentage < 0.3) {
      this.vm.result.marks.offbeat += 1;
      this.markJudge = "Offbeat";
    } else {
      // when note is too out of hit line, it can miss randomly
      if (Math.random() > 0.5) {
        this.vm.result.marks.offbeat += 1;
        this.markJudge = "Offbeat";
      } else {
        this.missNote();
      }
    }
    if (!this.vm.noFail && this.vm.health < 100 && this.percentage < 0.3) {
      this.vm.health += 0.3 - this.percentage; // TODO health addition
    }
  }

  hitAndCountScore(isHolding) {
    this.judge();
    if (this.noteFailed) return;
    this.vibrate(25);
    const { percentage } = this;
    let accuracyPercent = 100 * (1 - percentage);
    if (!this.accuracyJudged) {
      // hold note does not count towards accuracy percent
      this.vm.result.totalPercentage += accuracyPercent;
      this.vm.result.totalHitNotes += 1;
      this.accuracyJudged = true;
    }
    const buff = isHolding ? 0.5 : 1.2;
    this.vm.result.score += buff * accuracyPercent * this.vm.fever.value;
    this.vm.result.combo += 1;
    this.vm.result.maxCombo =
      this.vm.result.combo > this.vm.result.maxCombo
        ? this.vm.result.combo
        : this.vm.result.maxCombo;
    this.vm.fever.percent += (1 - percentage) / 100;
    this.judgeDisplay();
  }

  missNote() {
    this.vm.result.marks.miss += 1;
    this.vm.result.totalHitNotes += 1;
    this.vm.result.combo = 0;
    this.markJudge = "Miss";
    this.vm.fever.percent -= 0.1;
    if (!this.vm.noFail) this.vm.health -= 3; // TODO exp health reduction
    this.vibrate([20, 20, 50]);
    this.judgeDisplay();
    this.noteFailed = true;
  }

  isOutOfCanvas() {
    const yOut = this.y > this.canvas.height;
    const isHoldNoteOut =
      !this.isHoldNote ||
      (this.isHoldNote &&
        !this.isUserHolding &&
        !this.isHoldNoteFinished(true));
    if (this.vm.started && yOut && isHoldNoteOut && !this.noteFailed) {
      this.missNote();
    }
    const shouldClean =
      (yOut && !this.isHoldNote) ||
      (this.isHoldNote &&
        (this.holdNoteY > this.canvas.height || this.isHoldingDone));
    return shouldClean;
  }

  isHoldNoteFinished(nearly) {
    const offset = nearly
      ? Math.min.apply(0, [this.holdNoteHeight / 2, 100])
      : 0;
    return (
      this.holdNoteY > this.game.checkHitLineY - offset && this.didUserHold
    );
  }

  reposition() {
    // reposition y value based on current time
    const timing = this.game.playTime;
    const timeElapsed = timing - this.keyObj.t;
    const y =
      (timeElapsed * this.game.noteSpeedPxPerSec) / this.vm.playbackSpeed;
    this.y = y;
    this.gameHadBeenPaused = true;
  }

  update(isUserHolding) {
    this.setDelta();
    // game has been paused, reset delta
    if (this.delta > 0.5 || this.game.paused) {
      this.delta = 0;
      this.then = this.now;
      this.gameHadBeenPaused = true;
    }

    if (this.vm.inEditor && this.vm.selectedNotes.includes(this.keyObj)) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "orange";
      this.ctx.globalAlpha = 0.5;
    }

    const defaultColor = this.color ?? "yellow";
    if (
      this.isHoldNote ||
      (!this.vm.playMode && this.keyObj.h && this.keyObj.h[this.key])
    ) {
      let color = this.noteFailed ? "grey" : defaultColor;
      this.isHoldNote = true;
      this.isUserHolding = isUserHolding;
      this.drawHoldNote(color);
    } else {
      let color =
        this.y > this.game.checkHitLineY + this.singleNoteHeight
          ? "red"
          : defaultColor;
      if (!this.vm.playMode) color = defaultColor;
      this.drawSingleNote(color);
    }

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    if (this.game.paused) return;

    this.y += this.game.noteSpeedPxPerSec * this.delta;

    this.playSoundEffect();
  }

  drawSingleNote(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x, this.y, this.width, this.singleNoteHeight);
  }

  drawHoldNote(color) {
    const endTime = this.keyObj.h[this.key];
    const holdLengthInSec = endTime === -1 ? 100 : endTime - this.keyObj.t;
    const noteHeight =
      (holdLengthInSec * this.game.noteSpeedPxPerSec) / this.vm.playbackSpeed;
    this.holdNoteHeight = noteHeight;
    this.holdNoteY = this.y - noteHeight + this.singleNoteHeight;
    let paintY = this.holdNoteY < 0 ? 0 : this.holdNoteY;
    let paintHeight =
      this.holdNoteY < 0 ? this.holdNoteY + noteHeight : noteHeight;
    if (this.isUserHolding) paintHeight = this.game.checkHitLineY - paintY;
    if (!this.vm.playMode) {
      // creating hold note
      const isUserCreating =
        this.game.keyHoldingStatus[this.key] &&
        this.createdNote &&
        this.keyObj.h?.[this.key] === -1;
      if (isUserCreating) {
        paintY = this.game.checkHitLineY;
        paintHeight = paintHeight - paintY;
      }
    }
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x, paintY, this.width, paintHeight);
  }

  playSoundEffect() {
    if (
      !this.vm.inEditor ||
      !this.vm.options.soundEffect ||
      !this.vm.playMode
    ) {
      return;
    }
    if (!this.sePlayed && this.y >= this.game.checkHitLineY) {
      this.sePlayed = true;
      this.vm.$store.state.audio.playEffect("du", true);
    }
  }

  vibrate(pattern) {
    if (this.vm.vibrate && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  }

  judgeDisplay() {
    if (!this.vm.$refs.judgeDisplay || !this.vm.playMode) return;
    this.vm.$refs.judgeDisplay.judge(this.markJudge, this.vm.result.combo);
  }
}
