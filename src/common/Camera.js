class Camera {
  constructor(position, width, height) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.scale = 1;
  }

  setScale(s) {
    this.scale = s;
  }

  getScale() {
    return this.scale;
  }

  getPosition() {
    return {
      x: (-this.width * this.scale) / 2 - camera.cameraDeltaX * camera.scale,
      y: (-this.height * camera.scale) / 2 - camera.cameraDeltaY * camera.scale,
    };
  }
}
