import Note from "./note";

export default class DropTrack {
  constructor(vm, game, x, width, keyBind) {
    this.vm = vm;
    this.game = game;
    this.x = x;
    this.width = width;
    this.keyBind = keyBind;
    this.particleEffect = new HitEffect(vm);
    this.noteArr = [];
    this.hitIndicatorOpacity = 0;
    this.isKeyDown = false;
    this.isUserHoldingNote = false;
    this.updateHitGradient();
  }

  keyDown(key) {
    if (key.includes(this.keyBind) && !this.isKeyDown) {
      this.isKeyDown = true;
      this.hitIndicatorOpacity = 1;
      const createParticle = (markJudge) => {
        this.particleEffect.create(
          this.x,
          this.game.checkHitLineY,
          this.width,
          10,
          markJudge
        );
      };
      if (this.vm.playMode && this.noteArr && this.noteArr[0]) {
        const noteToDismiss = this.noteArr[0];
        if (noteToDismiss.getDiffPercentage() < 0.5) {
          noteToDismiss.didUserHold = true;
          noteToDismiss.calculatePercent();
          if (noteToDismiss.isHoldNote) {
            if (noteToDismiss.noteFailed) return;
            this.isUserHoldingNote = true;
            noteToDismiss.hitAndCountScore(true);
            let countInterval = setInterval(() => {
              // if hold note is finished or is nearly finished but player released key, count as success
              if (
                noteToDismiss.isHoldNoteFinished(false) ||
                (noteToDismiss.isHoldNoteFinished(true) &&
                  !this.isUserHoldingNote)
              ) {
                this.isUserHoldingNote = false;
                noteToDismiss.isHoldingDone = true;
                createParticle(noteToDismiss.markJudge);
                clearInterval(countInterval);
                return;
              }
              // else check if user is still holding, if so keep counting score.
              if (this.isUserHoldingNote && !noteToDismiss.noteFailed) {
                noteToDismiss.hitAndCountScore(true);
              } else {
                this.isUserHoldingNote = false;
                clearInterval(countInterval);
              }
            }, 100 / this.vm.playbackSpeed);
          } else {
            this.isUserHoldingNote = false;
            noteToDismiss.hitAndCountScore(false);
            this.noteArr.shift();
            this.playSoundEffect();
          }
          createParticle(noteToDismiss.markJudge);
        }
      }
    }
  }

  keyUp(key) {
    if (key.includes(this.keyBind)) {
      this.isKeyDown = false;
      this.isUserHoldingNote = false;
    }
  }

  dropNote(key, keyObj) {
    if (key.includes(this.keyBind) && !this.vm.playMode) {
      this.addNoteToArr(keyObj, null, this.game.checkHitLineY);
      this.playSoundEffect();
    }
  }

  // TODO fix the color and y logic here
  addNoteToArr(keyObj, color, y) {
    this.noteArr.push(
      new Note(
        this.vm,
        this.game,
        keyObj,
        this.keyBind,
        this.x,
        y,
        this.width,
        color
      )
    );
  }

  resizeTrack(x, width) {
    this.x = x;
    this.width = width;
  }

  repositionNotes(filteredNotes) {
    this.noteArr = [];
    const color = this.vm.playMode ? "yellow" : "grey";
    for (let note of filteredNotes) {
      if (note.k.includes(this.keyBind)) {
        this.addNoteToArr(note, color);
        this.noteArr[this.noteArr.length - 1].reposition();
      }
    }
  }

  playSoundEffect() {
    if (!this.vm.inEditor || !this.vm.options.soundEffect) return;
    this.vm.$store.state.audio.playEffect("du", true);
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
      const isUserHolding = i === 0 && this.isUserHoldingNote;
      // here noteArr[0] means the closest (i.e. oldest, or the next) note player are going to dismiss,
      // therefore if its the next note and user is holding, play the holding animation instead.
      this.noteArr[i].update(isUserHolding);
    }

    if (this.noteArr.length > 0 && this.noteArr[0].isOutOfCanvas()) {
      this.noteArr.shift(); // The oldest note now out of canvas note, remove the note.
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
      if (!this.isKeyDown) this.hitIndicatorOpacity -= 0.1;
      ctx.globalAlpha = 1;
    }

    // hit line
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.x, this.game.checkHitLineY, this.width, 10);

    // in editor, one time update
    if (this.game.paused) return;

    // particle effect
    this.particleEffect.update(this.isUserHoldingNote);

    // create note
    const { timeArr, timeArrIdx } = this.game;
    const timing = this.game.playTime;
    const needNote =
      !this.game.paused &&
      timeArrIdx < timeArr.length &&
      timing >= timeArr[timeArrIdx].t &&
      timeArr[timeArrIdx].k.includes(this.keyBind);
    if (needNote) {
      const color = this.vm.playMode ? "yellow" : "grey";
      if (timing - timeArr[timeArrIdx].t < 1) {
        this.addNoteToArr(timeArr[timeArrIdx], color);
      }
      return true; // this.game.timeArrIdx++;
    }
  }

  updateHitGradient() {
    let { ctx, canvas } = this.vm;
    // hit indicator gradient
    const hitGradient = ctx.createLinearGradient(
      0,
      (canvas.height / 10) * 7,
      0,
      canvas.height
    );
    hitGradient.addColorStop(0, "rgba(0,0,0,0)");
    hitGradient.addColorStop(1, "yellow");
    this.hitGradient = hitGradient;
  }
}

// ref https://css-tricks.com/adding-particle-effects-to-dom-elements-with-canvas/
export class HitEffect {
  constructor(vm) {
    this.colorData = ["yellow", "#DED51F", "#EBA400", "#FCC138"];
    this.reductionFactor = 5;
    this.particles = [];
    this.ctx = vm.effectCtx;
    this.vm = vm;
  }

  create(mX, mY, mWidth, height, judge) {
    let x = mX + mWidth / 2 - 5;
    let y = mY;
    if (this.vm.perspective) y -= 35;
    let width = 10;
    let count = 0;
    const rgb = this.getRgb(judge);
    this.circle = new ExpandingCircle(x + 5, y, rgb);
    this.holdCircle = new SpiningCircle(x + 5, y, rgb);

    // Go through every location of our button and create a particle
    for (let localX = 0; localX < width; localX++) {
      for (let localY = 0; localY < height; localY++) {
        if (count % this.reductionFactor === 0) {
          const globalX = x + localX;
          const globalY = y + localY;

          const color = `rgb(${rgb})`;
          this.createParticleAtPoint(globalX, globalY, [color]);
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

  getRgb(judge) {
    switch (judge) {
      case "Perfect":
        return "3, 252, 32";
      case "Good":
        return "3, 223, 252";
      case "Offbeat":
        return "255, 0, 55";
      default:
        return "255, 255, 0";
    }
  }

  update(drawHoldEffect) {
    this.circle?.draw(this.ctx);
    if (drawHoldEffect) this.holdCircle?.draw(this.ctx);
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
          this.circle = null;
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

class SpiningCircle {
  constructor(x, y, rgb) {
    this.x = x;
    this.y = y;
    this.offset = Math.random();
    this.radius = 100;
    this.rgb = rgb;
  }

  draw(ctx) {
    if (this.radius > 30) {
      let os = this.offset;
      let percent = 1 - this.radius / 100;
      ctx.strokeStyle = `rgba(${this.rgb}, ${1 - percent})`;
      ctx.lineWidth = 30 + 20 * percent;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 80, (os + 0) * Math.PI, (os + 0.5) * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x, this.y, 80, (os + 1) * Math.PI, (os + 1.5) * Math.PI);
      ctx.stroke();
      this.offset += 0.1 - percent / 10;
      // this.radius -= 4;
    }
  }
}

class ExpandingCircle {
  constructor(x, y, rgb) {
    this.x = x;
    this.y = y;
    this.offset = Math.random();
    this.radius = 30;
    this.rgb = rgb;
  }

  drawCircle(ctx, radius, percent) {
    const x = this.x,
      y = this.y,
      // Radii of the white glow.
      innerRadius = radius * 0.1,
      outerRadius = radius * 1.1;

    const gradient = ctx.createRadialGradient(
      x,
      y,
      innerRadius,
      x,
      y,
      outerRadius
    );
    gradient.addColorStop(0, `rgba(${this.rgb},0)`);
    gradient.addColorStop(1, `rgba(${this.rgb}, ${1 - percent})`);

    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  draw(ctx) {
    if (this.radius < 100) {
      let percent = this.radius / 100;

      // FIXME idk whats going on here
      this.drawCircle(ctx, this.radius + 20, percent);
      // this.drawCircle(ctx, this.radius - 20, percent);

      this.radius += 5;
    }
  }
}
