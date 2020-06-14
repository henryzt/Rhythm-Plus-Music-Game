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
    if (this.paused) {
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

  hitAndCountScore() {
    this.vibrate(25);
    const percentage = this.getDiffPercentage();
    let accuracyPercent = 100 * (1 - percentage);
    this.vm.result.totalPercentage += accuracyPercent;
    this.vm.result.totalHitNotes += 1;
    this.vm.result.score += 3 * accuracyPercent;
    this.vm.result.combo += 1;
    this.vm.result.maxCombo =
      this.vm.result.combo > this.vm.result.maxCombo
        ? this.vm.result.combo
        : this.vm.result.maxCombo;
    if (percentage < 0.05) {
      this.vm.result.marks.perfect += 1;
      this.vm.markJudge = "Perfect";
    } else if (percentage < 0.25) {
      this.vm.result.marks.good += 1;
      this.vm.markJudge = "Good";
    } else if (percentage < 0.5) {
      this.vm.result.marks.offbeat += 1;
      this.vm.markJudge = "Offbeat";
    }
    this.hitIndicator(this.vm);
  }

  isOutOfCanvas() {
    const isOut = this.y > this.canvas.height;
    if (this.vm.started && isOut) {
      this.vm.result.marks.miss += 1;
      this.vm.result.totalHitNotes += 1;
      this.vm.result.combo = 0;
      this.vm.markJudge = "Miss";
      this.vibrate([20, 20, 50]);
      this.hitIndicator(this.vm);
    }
    return isOut;
  }

  update() {
    this.setDelta();
    if (this.delta > 0.5) {
      this.delta = 0;
      this.then = this.now;
      this.paused = true;
    }
    const defaultColor = this.color ?? "yellow";
    let color =
      this.y > this.vm.checkHitLineY + this.singleNoteHeight
        ? "red"
        : defaultColor;
    if (!this.vm.playMode) color = defaultColor;

    if (this.keyObj.h && this.keyObj.h[this.key]) {
      color = "orange";
      this.drawHoldNote(color);
    } else {
      this.drawSingleNote(color);
    }

    this.y += this.vm.noteSpeedPxPerSec * this.delta;
  }

  drawSingleNote(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x, this.y, this.width, this.singleNoteHeight);
  }

  drawHoldNote(color) {
    let holdLengthInSec = this.keyObj.h[this.key];
    holdLengthInSec = holdLengthInSec === -1 ? 100 : holdLengthInSec;
    const noteHeight = holdLengthInSec * this.vm.noteSpeedPxPerSec;
    this.holdNoteY = this.y - noteHeight + this.singleNoteHeight;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.x, this.holdNoteY, this.width, noteHeight);
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
