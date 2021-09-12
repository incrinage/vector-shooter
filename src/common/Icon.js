export default class Icon {
  /**
   * Creates an Icon representing an object that can be created
   * The class must be an Actor
   *
   * @param {*} objectClass
   */
  constructor(objectClass) {
    this.width = 25;
    this.height = 25;
    this.position = [0, 0];
    this.objectClass = objectClass;
  }

  setPosition(pos) {
    this.position = pos;
  }

  getPosition() {
    return this.position;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getObject() {
    return new this.objectClass();
  }

  getClass() {
    return this.objectClass;
  }

  render(ctx) {
    const [x, y] = this.position;
    ctx.strokeStyle = "green";
    ctx.strokeRect(x, y, this.width, this.height);
  }
}
