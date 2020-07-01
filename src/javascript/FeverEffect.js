export default class FeverEffect {
  constructor(vm, game) {
    this.vm = vm;
    this.game = game;
    this.yOffset = -this.game.canvas.height;
  }

  drawArrow(y) {
    const {ctx, startX, endX} = this.game;
    const midX = (startX + endX) / 2;
    const height = 100;
    const thickness = 200;
    ctx.beginPath();
    ctx.moveTo(midX, y);
    ctx.lineTo(endX, y + thickness);
    ctx.lineTo(endX, y + thickness + height);
    ctx.lineTo(midX, y + height);
    ctx.lineTo(startX, y + thickness + height);
    ctx.lineTo(startX, y + thickness);
    ctx.lineTo(midX, y);
    ctx.fill();
  }

  update() {
    let {fever} = this.vm;
    const {ctx} = this.game;
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
