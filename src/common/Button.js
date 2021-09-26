export default class Button {
  constructor([x = 0, y = 0], width, height, color, text) {
    this.position = [x, y];
    this.width = width;
    this.height = height;
    this.color = color;
    this.text = text;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getPosition() {
    return this.position;
  }

  render(ctx) {
    const [x, y] = this.position;
    ctx.font = "12px serif";
    ctx.clearRect(x, y, this.width, this.height);
    ctx.strokeRect(x, y, this.width, this.height);

    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, this.width, this.height);

    this.renderText(ctx);
  }

  renderText(ctx) {
    const [x, y] = this.position;
    ctx.strokeStyle = "black";
    ctx.strokeText(this.text, x, y + this.getHeight() / 2);
  }
}
