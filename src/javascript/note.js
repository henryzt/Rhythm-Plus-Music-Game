export default class Note {
  constructor(vm, game, keyObj, key, x, width, color) {
    this.x = x;
    this.width = width;
    this.color = color;
    this.vm = vm;
    this.game = game;
    this.keyObj = keyObj;
    this.key = key;
    this.ctx = vm.ctx;
    this.canvas = vm.canvas;
    this.percentage = 0;
    this.isHoldNote = keyObj.h && keyObj.h[key];
    this.isUserHolding = false;
    this.isHoldingDone = false;

    this.y = 0;
    this.singleNoteHeight = 10;

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
    if (this.gameHadBeenPaused) {
      // game had been pasued, time unuseable, use less accurate dist calculation instead
      const dist = this.vm.checkHitLineY - this.y;
      const percentage = Math.abs(dist) / this.canvas.height; // the lower the better

      return percentage;
    } else {
      let hitTimeSinceStartInSec =
        (parseFloat(Date.now()) - parseFloat(this.timeStarted)) / 1000;
      const diff = Math.abs(this.vm.noteSpeedInSec - hitTimeSinceStartInSec);
      let percentage = diff / this.vm.noteSpeedInSec; // the lower the better

      return percentage;
    }
  }

  calculatePercent() {
    this.percentage = 1 - ((1 - this.getDiffPercentage() - 0.2) / 4) * 5;
    this.percentage = this.percentage < 1 ? this.percentage : 1;
    this.judge();
  }

  judge() {
    if (this.percentage < 0.05) {
      this.vm.result.marks.perfect += 1;
      this.vm.markJudge = "Perfect";
    } else if (this.percentage < 0.25) {
      this.vm.result.marks.good += 1;
      this.vm.markJudge = "Good";
    } else if (this.percentage < 0.5) {
      this.vm.result.marks.offbeat += 1;
      this.vm.markJudge = "Offbeat";
    }
  }

  hitAndCountScore(isHolding) {
    this.vibrate(25);
    this.judge();
    const {percentage} = this;
    let accuracyPercent = 100 * (1 - percentage);
    if (!isHolding) {
      // hold note does not count towards accuracy percent
      this.vm.result.totalPercentage += accuracyPercent;
      this.vm.result.totalHitNotes += 1;
    }
    this.vm.result.score += 2 * accuracyPercent * this.vm.fever.value;
    this.vm.result.combo += 1;
    this.vm.result.maxCombo =
      this.vm.result.combo > this.vm.result.maxCombo
        ? this.vm.result.combo
        : this.vm.result.maxCombo;
    this.vm.fever.percent += (1 - percentage) / 100;
    this.hitIndicator(this.vm);
  }

  isOutOfCanvas() {
    const yOut = this.y > this.canvas.height;
    const isOut =
      (yOut && !this.isHoldNote) ||
      (yOut &&
        this.isHoldNote &&
        !this.isUserHolding &&
        !this.isHoldNoteFinished(true));
    if (this.vm.started && isOut && !this.noteFailed) {
      this.vm.result.marks.miss += 1;
      this.vm.result.totalHitNotes += 1;
      this.vm.result.combo = 0;
      this.vm.markJudge = "Miss";
      this.vm.fever.percent -= 0.1;
      this.vibrate([20, 20, 50]);
      this.hitIndicator(this.vm);
      this.noteFailed = true;
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
    return this.holdNoteY > this.vm.checkHitLineY - offset;
  }

  reposition() {
    // reposition y value based on current time
    const timing = this.game.getNoteTiming();
    const timeElapsed = timing - this.keyObj.t;
    const y = (timeElapsed / this.vm.noteSpeedInSec) * this.vm.checkHitLineY;
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
        this.y > this.vm.checkHitLineY + this.singleNoteHeight
          ? "red"
          : defaultColor;
      if (!this.vm.playMode) color = defaultColor;
      this.drawSingleNote(color);
    }

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    if (this.game.paused) return;

    this.y += this.vm.noteSpeedPxPerSec * this.delta;

    this.playSoundEffect();
  }

  drawSingleNote(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x, this.y, this.width, this.singleNoteHeight);
  }

  drawHoldNote(color) {
    const endTime = this.keyObj.h[this.key];
    const holdLengthInSec = (endTime === -1) ? 100 : endTime - this.keyObj.t;
    const noteHeight = holdLengthInSec * this.vm.noteSpeedPxPerSec;
    this.holdNoteHeight = noteHeight;
    this.holdNoteY = this.y - noteHeight + this.singleNoteHeight;
    const paintY = this.holdNoteY < 0 ? 0 : this.holdNoteY;
    let paintHeight =
      this.holdNoteY < 0 ? this.holdNoteY + noteHeight : noteHeight;
    paintHeight = this.isUserHolding
      ? this.vm.checkHitLineY - paintY
      : paintHeight;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x, paintY, this.width, paintHeight);
  }

  playSoundEffect() {
    if (!this.vm.inEditor || !this.vm.soundEffect || !this.vm.playMode) return;
    if (!this.sePlayed && this.y >= this.vm.checkHitLineY) {
      this.sePlayed = true;
      this.vm.$store.state.audio.playEffect("/audio/effects/du.mp3");
    }
  }

  vibrate(pattern) {
    if (this.vm.vibrate && window.navigator.vibrate)
      window.navigator.vibrate(pattern);
  }

  hitIndicator() {
    if (!this.vm.$refs.hitIndicator || !this.vm.playMode) return;
    this.vm.$refs.hitIndicator.classList.remove("hitAnimation");
    setTimeout(() => {
      this.vm.$refs.hitIndicator.classList.add("hitAnimation");
    }, 2);
  }
}
