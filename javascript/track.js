function DropTrack(x, width, keyBind) {
  this.x = x;
  this.width = width;
  this.keyBind = keyBind;

  this.hitIndicatorOpacity = 0;
  this.noteArr = [];

  this.keyDown = function(key) {
    if (keyBind == key) {
      this.hitIndicatorOpacity = 1;
      if (!app.playMode) {
        //create mode
        this.noteArr.push(new Note(this.x, this.width));
      } else {
        //play mode
        if (this.noteArr && this.noteArr[0]) {
          let noteToDismiss = this.noteArr[0];
          if (noteToDismiss.getDistPercentage() < 2) {
            noteToDismiss.hitAndCountScore();
            this.noteArr.shift();
          }
        }
      }
    }
  };

  this.resizeTrack = function(x, width) {
    this.x = x;
    this.width = width;
  };

  this.update = function() {
    //track bg
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#212121";
    ctx.fillRect(this.x, 0, this.width, canvas.height);
    ctx.globalAlpha = 1;
    //hit line
    ctx.fillStyle = "#ffffff";
    let hitLineY = app.playMode ? checkHitLineY : 0;
    ctx.fillRect(this.x, hitLineY, this.width, 10);
    //note update
    for (let i = 0; i < this.noteArr.length; ++i) {
      this.noteArr[i].update();
      if (this.noteArr[i].isOutOfCanvas()) {
        this.noteArr.splice(i, 1); // Remove out of canvas note
        --i; // Correct the index value
      }
    }
    //hit indicator
    if (this.hitIndicatorOpacity > 0) {
      ctx.fillStyle = hitGradient;
      ctx.globalAlpha = this.hitIndicatorOpacity;
      ctx.fillRect(this.x, (canvas.height / 10) * 8, this.width, (canvas.height / 10) * 2);
      this.hitIndicatorOpacity -= 0.01;
      ctx.globalAlpha = 1;
    }

    //create note
    let needNote =
      app.playMode &&
      timeArrIdx < timeArr.length &&
      playTime >= timeArr[timeArrIdx].time &&
      timeArr[timeArrIdx].key == keyBind;

    if (needNote) {
      console.log(playTime);
      this.noteArr.push(new Note(this.x, this.width));
      timeArrIdx++;
    }
  };
}
