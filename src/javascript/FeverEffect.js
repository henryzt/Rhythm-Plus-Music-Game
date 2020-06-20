export default class FeverEffect {
  constructor(vm, game) {
    this.vm = vm;
    this.game = game;
    this.yOffset = 0;
  }

  drawArrow(y) {
    const ctx = this.game.ctx;
    const x1 = this.game.startX;
    const x2 = this.game.endX;
    const xm = (x1 + x2) / 2;
    const height = 100;
    const thickness = 200;
    ctx.beginPath();
    ctx.moveTo(xm, y);
    ctx.lineTo(x2, y + thickness);
    ctx.lineTo(x2, y + thickness + height);
    ctx.lineTo(xm, y + height);
    ctx.lineTo(x1, y + thickness + height);
    ctx.lineTo(x1, y + thickness);
    ctx.lineTo(xm, y);
    ctx.fill();
  }

  update() {
    let fever = this.vm.fever;
    const ctx = this.game.ctx;
    if (fever.value <= 1) return;
    const height = 300;
    const cHeight = this.game.canvas.height;
    const num = cHeight / height + 2;
    const speed = fever.time - 10;
    const alpha = fever.time / 80;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < num; i++) {
      ctx.fillStyle = "white";
      this.drawArrow(300 * i - this.yOffset);
    }
    ctx.globalAlpha = 1;
    this.yOffset += speed;
    if (this.yOffset >= 300) this.yOffset = 0;
    if (this.yOffset <= -cHeight) this.yOffset = -cHeight;
  }
}
