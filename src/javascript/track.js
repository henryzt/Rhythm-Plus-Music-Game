import Note from "./note";

export default function DropTrack(vm, game, x, width, keyBind) {
  this.x = x;
  this.width = width;
  this.keyBind = keyBind;
  const { ctx, canvas } = vm;
  const hitGradient = getHitGradient(ctx, canvas);

  this.particleEffect = new HitParticleEffect(ctx);

  this.hitIndicatorOpacity = 0;
  this.noteArr = [];

  this.keyDown = function (key) {
    if (keyBind == key) {
      this.hitIndicatorOpacity = 1;
      if (!vm.playMode) {
        // create mode
        this.noteArr.push(new Note(vm, this.x, this.width));
      } else {
        // play mode
        if (this.noteArr && this.noteArr[0]) {
          const noteToDismiss = this.noteArr[0];
          if (noteToDismiss.getDistPercentage() < 2) {
            noteToDismiss.hitAndCountScore();
            this.noteArr.shift();
            this.particleEffect.create(
              this.x,
              vm.checkHitLineY,
              this.width,
              10
            );
          }
        }
      }
    }
  };

  this.resizeTrack = function (x, width) {
    this.x = x;
    this.width = width;
  };

  this.update = () => {
    // track bg
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#212121";
    ctx.fillRect(this.x, 0, this.width, canvas.height);
    ctx.globalAlpha = 1;

    // note update
    for (let i = 0; i < this.noteArr.length; ++i) {
      this.noteArr[i].update();
      if (this.noteArr[i].isOutOfCanvas()) {
        this.noteArr.splice(i, 1); // Remove out of canvas note
        --i; // Correct the index value
      }
    }
    // hit indicator
    if (this.hitIndicatorOpacity > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.hitIndicatorOpacity / 20})`;
      // let rectWidth = this.width * this.hitIndicatorOpacity;
      // ctx.fillRect(this.x + this.width / 2 - rectWidth / 2, 0, rectWidth, canvas.height);
      ctx.fillRect(this.x, 0, this.width, canvas.height);
      // yellow gradient
      ctx.fillStyle = hitGradient;
      ctx.globalAlpha = this.hitIndicatorOpacity;
      ctx.fillRect(
        this.x,
        (canvas.height / 10) * 6,
        this.width,
        (canvas.height / 10) * 4
      );
      this.hitIndicatorOpacity -= 0.02;
      ctx.globalAlpha = 1;
    }

    // hit line
    ctx.fillStyle = "#ffffff";
    const hitLineY = vm.playMode ? vm.checkHitLineY : 0;
    ctx.fillRect(this.x, hitLineY, this.width, 10);

    // particel effect
    this.particleEffect.update();

    // create note
    const needNote =
      vm.playMode &&
      game.timeArrIdx < game.timeArr.length &&
      game.playTime >= game.timeArr[game.timeArrIdx].time &&
      game.timeArr[game.timeArrIdx].key == keyBind;

    if (needNote) {
      if (game.playTime - game.timeArr[game.timeArrIdx].time < 1) {
        console.log(game.playTime);
        this.noteArr.push(new Note(vm, this.x, this.width));
      }
      game.timeArrIdx++;
    }
  };
}

function getHitGradient(ctx, canvas) {
  // hit indicator gradient
  const hitGradient = ctx.createLinearGradient(
    0,
    (canvas.height / 10) * 7,
    0,
    canvas.height
  );
  hitGradient.addColorStop(0, "rgba(0,0,0,0)");
  hitGradient.addColorStop(1, "yellow");
  return hitGradient;
}

// ref https://css-tricks.com/adding-particle-effects-to-dom-elements-with-canvas/

function HitParticleEffect(ctx) {
  const colorData = ["yellow", "#DED51F", "#EBA400", "#FCC138"];
  const reductionFactor = 50;

  this.create = function (x, y, width, height) {
    let count = 0;

    // Go through every location of our button and create a particle
    for (let localX = 0; localX < width; localX++) {
      for (let localY = 0; localY < height; localY++) {
        if (count % reductionFactor === 0) {
          const globalX = x + localX;
          const globalY = y + localY;

          this.createParticleAtPoint(globalX, globalY, colorData);
        }
        count++;
      }
    }
  };

  /* An "exploding" particle effect that uses circles */
  const ExplodingParticle = function () {
    // Set how long we want our particle to animate for
    this.animationDuration = 1000; // in ms

    // Set the speed for our particle
    this.speed = {
      x: -5 + Math.random() * 10,
      y: -5 + Math.random() * 10,
    };

    // Size our particle
    this.radius = 5 + Math.random() * 10;

    // Set a max time to live for our particle
    this.life = 20 + Math.random() * 10;
    this.remainingLife = this.life;

    // This function will be called by our animation logic later on
    this.draw = (ctx) => {
      const p = this;

      if (this.remainingLife > 0 && this.radius > 0) {
        // Draw a circle at the current location
        ctx.beginPath();
        // ctx.arc(p.startX, p.startY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.rgbArray[
          Math.floor(Math.random() * this.rgbArray.length)
        ];
        ctx.fillRect(p.startX, p.startY, p.radius, p.radius);
        // ctx.fill();

        // Update the particle's location and life
        p.remainingLife--;
        p.radius -= 0.25;
        p.startX += p.speed.x;
        p.startY += p.speed.y;
      }
    };
  };

  let particles = [];
  this.createParticleAtPoint = function (x, y, colorData) {
    const particle = new ExplodingParticle(ctx);
    particle.rgbArray = colorData;
    particle.startX = x;
    particle.startY = y;
    particle.startTime = Date.now();

    particles.push(particle);
  };

  this.update = function () {
    // Clear out the old particles
    // if (typeof ctx !== "undefined") {
    //   ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // }

    // Draw all of our particles in their new location
    for (let i = 0; i < particles.length; i++) {
      ctx.globalAlpha = 0.7;
      particles[i].draw(ctx);
      ctx.globalAlpha = 1;
      // Simple way to clean up if the last particle is done animating
      if (i === particles.length - 1) {
        const percent =
          (Date.now() - particles[i].startTime) /
          particles[i].animationDuration;

        if (percent > 1) {
          particles = [];
        }
      }
    }
  };
}
