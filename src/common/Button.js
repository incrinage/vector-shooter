export default class Button {
  constructor([x = 0, y = 0], width, height) {
    this.position = [x, y];
    this.width = width;
    this.height = height;
    this.color = "#a3e4f7";
    this.text = "Inventory";
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

    ctx.strokeStyle = "black";
    ctx.strokeText(this.text, x + 2, y + this.height / 2);
  }
}
