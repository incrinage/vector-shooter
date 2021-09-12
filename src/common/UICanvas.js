export default class UICanvas {
  constructor(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.className = "gameUI";
    this.ctx = this.canvas.getContext("2d", { alpha: false });
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.ctx;
  }
}
