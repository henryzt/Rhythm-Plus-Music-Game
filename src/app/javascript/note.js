function Note(x, width) {
  this.x = x;
  this.width = width;

  this.y = 0;

  // modulate speed, ref https://www.viget.com/articles/time-based-animation/
  this.now = Date.now();
  this.delta = 0;
  this.then = 0;

  this.setDelta = function() {
    if (this.then == 0) this.then = this.now;
    this.now = Date.now();
    this.delta = (parseFloat(this.now) - parseFloat(this.then)) / 1000; // seconds since last frame
    this.then = this.now;
  };

  this.getDistPercentage = function() {
    let dist = checkHitLineY - this.y;
    let percentage = Math.abs(dist) / (canvas.height / 10); //the lower the better

    console.log(dist, percentage);
    return percentage;
  };

  this.hitAndCountScore = function() {
    let percentage = this.getDistPercentage();
    app.score = app.score + 1000 * (3 - percentage);
    app.combo += 1;
    app.maxCombo = app.combo > app.maxCombo ? app.combo : app.maxCombo;
    if (percentage < 0.3) {
      app.marks.perfect += 1;
      app.lastMark = "Perfect";
    } else if (percentage < 0.6) {
      app.marks.good += 1;
      app.lastMark = "Good";
    } else if (percentage < 0.9) {
      app.marks.offbeat += 1;
      app.lastMark = "Offbeat";
    }
    hitIndicator();
  };

  this.isOutOfCanvas = function() {
    let isOut = this.y > canvas.height;
    if (app.playMode && isOut) {
      app.marks.miss += 1;
      app.combo = 0;
      app.lastMark = "Miss";
      hitIndicator();
    }
    return isOut;
  };

  this.update = function() {
    this.setDelta();
    let color = this.y > checkHitLineY + 10 ? "red" : "yellow";
    //Make note blur when get missed.
    ctx.filter = this.y > checkHitLineY + 10 ? "blur(5px)" : "blur(0px)";
    ctx.fillStyle = color;
    ctx.fillRect(x, this.y, this.width, 10);
    ctx.filter = "none";
    this.y += noteSpeedPxPerSec * this.delta;
  };
}

function hitIndicator() {
  app.$refs.hitIndicator.classList.remove("hitAnimation");
  setTimeout(() => {
    app.$refs.hitIndicator.classList.add("hitAnimation");
  }, 1);
}
