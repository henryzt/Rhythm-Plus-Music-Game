export default function Note(vm, x, width) {
  this.x = x;
  this.width = width;
  const { ctx, canvas } = vm;

  this.y = 0;

  // modulate speed, ref https://www.viget.com/articles/time-based-animation/
  this.now = Date.now();
  this.delta = 0;
  this.then = 0;
  this.timeStarted = this.now;

  this.setDelta = function () {
    if (this.then === 0) this.then = this.now;
    this.now = Date.now();
    this.delta = (parseFloat(this.now) - parseFloat(this.then)) / 1000; // seconds since last frame
    this.then = this.now;
  };

  this.getDiffPercentage = function () {
    // const dist = vm.checkHitLineY - this.y;
    // const percentage = Math.abs(dist) / (canvas.height / 10); // the lower the better
    let hitTimeSinceStartInSec =
      (parseFloat(Date.now()) - parseFloat(this.timeStarted)) / 1000;
    const diff = Math.abs(vm.noteSpeedInSec - hitTimeSinceStartInSec);
    let percentage = diff / vm.noteSpeedInSec; // the lower the better

    return percentage;
  };

  this.hitAndCountScore = function () {
    this.vibrate(25);
    const percentage = this.getDiffPercentage();
    let accuracyPercent = 100 * (1 - percentage);
    vm.result.totalPercentage += accuracyPercent;
    vm.result.totalHitNotes += 1;
    vm.result.score += 3 * accuracyPercent;
    vm.result.combo += 1;
    vm.result.maxCombo =
      vm.result.combo > vm.result.maxCombo
        ? vm.result.combo
        : vm.result.maxCombo;
    if (percentage < 0.05) {
      vm.result.marks.perfect += 1;
      vm.markJudge = "Perfect";
    } else if (percentage < 0.25) {
      vm.result.marks.good += 1;
      vm.markJudge = "Good";
    } else if (percentage < 0.5) {
      vm.result.marks.offbeat += 1;
      vm.markJudge = "Offbeat";
    }
    this.hitIndicator(vm);
  };

  this.isOutOfCanvas = function () {
    const isOut = this.y > canvas.height;
    if (vm.playMode && isOut) {
      vm.result.marks.miss += 1;
      vm.result.totalHitNotes += 1;
      vm.result.combo = 0;
      vm.markJudge = "Miss";
      this.vibrate([20, 20, 50]);
      this.hitIndicator(vm);
    }
    return isOut;
  };

  this.update = function () {
    this.setDelta();
    const color = this.y > vm.checkHitLineY + 10 ? "red" : "yellow";
    // Make note blur when get missed.
    ctx.filter = this.y > vm.checkHitLineY + 10 ? "blur(5px)" : "blur(0px)";
    ctx.fillStyle = color;
    ctx.fillRect(x, this.y, this.width, 10);
    ctx.filter = "none";
    this.y += vm.noteSpeedPxPerSec * this.delta;
  };

  this.vibrate = function (pattern) {
    if (vm.vibrate && window.navigator.vibrate)
      window.navigator.vibrate(pattern);
  };

  this.hitIndicator = function () {
    vm.$refs.hitIndicator.classList.remove("hitAnimation");
    setTimeout(() => {
      vm.$refs.hitIndicator.classList.add("hitAnimation");
    }, 1);
  };
}
