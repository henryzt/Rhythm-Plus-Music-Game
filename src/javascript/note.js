export default function Note(vm, x, width) {
  this.x = x;
  this.width = width;
  const { ctx, canvas } = vm;

  this.y = 0;

  // modulate speed, ref https://www.viget.com/articles/time-based-animation/
  this.now = Date.now();
  this.delta = 0;
  this.then = 0;

  this.setDelta = function () {
    if (this.then == 0) this.then = this.now;
    this.now = Date.now();
    this.delta = (parseFloat(this.now) - parseFloat(this.then)) / 1000; // seconds since last frame
    this.then = this.now;
  };

  this.getDistPercentage = function () {
    const dist = vm.checkHitLineY - this.y;
    const percentage = Math.abs(dist) / (canvas.height / 10); // the lower the better

    console.log(dist, percentage);
    return percentage;
  };

  this.hitAndCountScore = function () {
    const percentage = this.getDistPercentage();
    vm.score += 1000 * (3 - percentage);
    vm.combo += 1;
    vm.maxCombo = vm.combo > vm.maxCombo ? vm.combo : vm.maxCombo;
    if (percentage < 0.3) {
      vm.marks.perfect += 1;
      vm.markJudge = "Perfect";
    } else if (percentage < 0.6) {
      vm.marks.good += 1;
      vm.markJudge = "Good";
    } else if (percentage < 0.9) {
      vm.marks.offbeat += 1;
      vm.markJudge = "Offbeat";
    }
    hitIndicator(vm);
  };

  this.isOutOfCanvas = function () {
    const isOut = this.y > canvas.height;
    if (vm.playMode && isOut) {
      vm.marks.miss += 1;
      vm.combo = 0;
      vm.markJudge = "Miss";
      hitIndicator(vm);
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
}

function hitIndicator(vm) {
  vm.$refs.hitIndicator.classList.remove("hitAnimation");
  setTimeout(() => {
    vm.$refs.hitIndicator.classList.add("hitAnimation");
  }, 1);
}
