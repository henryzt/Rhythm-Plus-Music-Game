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

  this.getScore = function() {
    return checkHitLineY - this.y;
  };

  this.isOutOfCanvas = function() {
    return this.y > canvas.height;
  };

  this.update = function() {
    this.setDelta();
    let color = this.y > checkHitLineY + 10 ? "red" : "yellow";
    ctx.fillStyle = color;
    ctx.fillRect(x, this.y, this.width, 10);
    this.y += noteSpeedPxPerSec * this.delta;
  };
}
