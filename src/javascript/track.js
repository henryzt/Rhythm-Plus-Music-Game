import Note from "./note";

export default class DropTrack {
  constructor(vm, game, x, width, keyBind) {
    this.vm = vm;
    this.game = game;
    this.x = x;
    this.width = width;
    this.keyBind = keyBind;
    this.particleEffect = new HitParticleEffect(vm.ctx);
    this.noteArr = [];
    this.hitIndicatorOpacity = 0;
  }

  keyDown(key) {
    if (this.keyBind === key) {
      this.hitIndicatorOpacity = 1;
      if (!this.vm.playMode) {
        // create mode
        this.noteArr.push(new Note(this.vm, this.x, this.width));
      } else if (this.noteArr && this.noteArr[0]) {
        const noteToDismiss = this.noteArr[0];
        if (noteToDismiss.getDistPercentage() < 2) {
          noteToDismiss.hitAndCountScore();
          this.noteArr.shift();
          this.particleEffect.create(
            this.x,
            this.vm.checkHitLineY,
            this.width,
            10
          );
        }
      }
    }
  }

  resizeTrack(x, width) {
    this.x = x;
    this.width = width;
  }

  update() {
    // track bg
    let { ctx, canvas } = this.vm;
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
      ctx.fillStyle = this.hitGradient;
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
    const { playMode, checkHitLineY } = this.vm;
    const hitLineY = playMode ? checkHitLineY : 0;
    ctx.fillRect(this.x, hitLineY, this.width, 10);

    // particle effect
    this.particleEffect.update();

    // create note
    const { timeArr, playTime } = this.game;
    const needNote =
      playMode &&
      this.game.timeArrIdx < timeArr.length &&
      playTime >= timeArr[this.game.timeArrIdx].time &&
      timeArr[this.game.timeArrIdx].key === this.keyBind;

    if (needNote) {
      if (playTime - timeArr[this.game.timeArrIdx].time < 1) {
        this.noteArr.push(new Note(this.vm, this.x, this.width));
      }
      this.game.timeArrIdx++;
    }
  }

  getHitGradient(ctx, canvas) {
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
}

// ref https://css-tricks.com/adding-particle-effects-to-dom-elements-with-canvas/
export class HitParticleEffect {
  constructor() {
    this.colorData = ["yellow", "#DED51F", "#EBA400", "#FCC138"];
    this.reductionFactor = 50;
    this.particles = [];
  }

  create(x, y, width, height) {
    let count = 0;

    // Go through every location of our button and create a particle
    for (let localX = 0; localX < width; localX++) {
      for (let localY = 0; localY < height; localY++) {
        if (count % this.reductionFactor === 0) {
          const globalX = x + localX;
          const globalY = y + localY;

          this.createParticleAtPoint(globalX, globalY, this.colorData);
        }
        count++;
      }
    }
  }

  createParticleAtPoint(x, y, colorData) {
    const particle = new ExplodingParticle(this.ctx);
    particle.rgbArray = colorData;
    particle.startX = x;
    particle.startY = y;
    particle.startTime = Date.now();
    this.particles.push(particle);
  }

  update() {
    // Clear out the old particles
    // if (typeof ctx !== "undefined") {
    //   ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // }

    // Draw all of our particles in their new location
    for (let i = 0; i < this.particles.length; i++) {
      this.ctx.globalAlpha = 0.7;
      this.particles[i].draw(this.ctx);
      this.ctx.globalAlpha = 1;
      // Simple way to clean up if the last particle is done animating
      if (i === this.particles.length - 1) {
        const percent =
          (Date.now() - this.particles[i].startTime) /
          this.particles[i].animationDuration;

        if (percent > 1) {
          this.particles = [];
        }
      }
    }
  }
}

class ExplodingParticle {
  constructor() {
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
    this.remainingLife = 20 + Math.random() * 10;
  }

  draw(ctx) {
    if (this.remainingLife > 0 && this.radius > 0) {
      // Draw a circle at the current location
      ctx.beginPath();
      // ctx.arc(p.startX, p.startY, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.rgbArray[
        Math.floor(Math.random() * this.rgbArray.length)
      ];
      ctx.fillRect(this.startX, this.startY, this.radius, this.radius);
      // ctx.fill();

      // Update the particle's location and life
      this.remainingLife--;
      this.radius -= 0.25;
      this.startX += this.speed.x;
      this.startY += this.speed.y;
    }
  }
}
