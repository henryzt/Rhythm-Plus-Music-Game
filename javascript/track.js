function DropTrack(x, width, keyBind) {
  this.x = x;
  this.width = width;
  this.keyBind = keyBind;

  this.particleEffect = new HitParticleEffect();

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
            this.particleEffect.create(this.x, checkHitLineY, this.width, 10);
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
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#212121";
    ctx.fillRect(this.x, 0, this.width, canvas.height);
    ctx.globalAlpha = 1;

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
      ctx.fillStyle = "rgba(255,255,255," + this.hitIndicatorOpacity / 20 + ")";
      // let rectWidth = this.width * this.hitIndicatorOpacity;
      // ctx.fillRect(this.x + this.width / 2 - rectWidth / 2, 0, rectWidth, canvas.height);
      ctx.fillRect(this.x, 0, this.width, canvas.height);
      //yellow gradient
      ctx.fillStyle = hitGradient;
      ctx.globalAlpha = this.hitIndicatorOpacity;
      ctx.fillRect(this.x, (canvas.height / 10) * 6, this.width, (canvas.height / 10) * 4);
      this.hitIndicatorOpacity -= 0.02;
      ctx.globalAlpha = 1;
    }

    //hit line
    ctx.fillStyle = "#ffffff";
    let hitLineY = app.playMode ? checkHitLineY : 0;
    ctx.fillRect(this.x, hitLineY, this.width, 10);

    this.particleEffect.update();

    //create note
    let needNote =
      app.playMode &&
      timeArrIdx < timeArr.length &&
      playTime >= timeArr[timeArrIdx].time &&
      timeArr[timeArrIdx].key == keyBind;

    if (needNote) {
      if (playTime - timeArr[timeArrIdx].time < 1) {
        console.log(playTime);
        this.noteArr.push(new Note(this.x, this.width));
      }
      timeArrIdx++;
    }
  };
}

// ref https://css-tricks.com/adding-particle-effects-to-dom-elements-with-canvas/

function HitParticleEffect() {
  let colorData = ["yellow", "#DED51F", "#EBA400", "#FCC138"];
  let reductionFactor = 50;

  this.create = function(x, y, width, height) {
    let count = 0;

    // Go through every location of our button and create a particle
    for (let localX = 0; localX < width; localX++) {
      for (let localY = 0; localY < height; localY++) {
        if (count % reductionFactor === 0) {
          let globalX = x + localX;
          let globalY = y + localY;

          this.createParticleAtPoint(globalX, globalY, colorData);
        }
        count++;
      }
    }
  };

  /* An "exploding" particle effect that uses circles */
  let ExplodingParticle = function() {
    // Set how long we want our particle to animate for
    this.animationDuration = 1000; // in ms

    // Set the speed for our particle
    this.speed = {
      x: -5 + Math.random() * 10,
      y: -5 + Math.random() * 10
    };

    // Size our particle
    this.radius = 5 + Math.random() * 5;

    // Set a max time to live for our particle
    this.life = 30 + Math.random() * 10;
    this.remainingLife = this.life;

    // This function will be called by our animation logic later on
    this.draw = ctx => {
      let p = this;

      if (this.remainingLife > 0 && this.radius > 0) {
        // Draw a circle at the current location
        ctx.beginPath();
        ctx.arc(p.startX, p.startY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.rgbArray[Math.floor(Math.random() * this.rgbArray.length)];
        ctx.fill();

        // Update the particle's location and life
        p.remainingLife--;
        p.radius -= 0.25;
        p.startX += p.speed.x;
        p.startY += p.speed.y;
      }
    };
  };

  let particles = [];
  this.createParticleAtPoint = function(x, y, colorData) {
    let particle = new ExplodingParticle();
    particle.rgbArray = colorData;
    particle.startX = x;
    particle.startY = y;
    particle.startTime = Date.now();

    particles.push(particle);
  };

  this.update = function() {
    // Clear out the old particles
    // if (typeof ctx !== "undefined") {
    //   ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // }

    // Draw all of our particles in their new location
    for (let i = 0; i < particles.length; i++) {
      ctx.globalAlpha = 0.6;
      particles[i].draw(ctx);
      ctx.globalAlpha = 1;
      // Simple way to clean up if the last particle is done animating
      if (i === particles.length - 1) {
        let percent = (Date.now() - particles[i].startTime) / particles[i].animationDuration;

        if (percent > 1) {
          particles = [];
        }
      }
    }
  };
}
