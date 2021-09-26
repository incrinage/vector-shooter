export default class IconList {
  constructor(position, width, height) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.icons = [];
  }

  add(item) {
    this.icons.push(item);
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  forEach(fn) {
    this.icons.forEach(fn);
  }

  render(ctx) {
    const [x, y] = this.position;
    let space = 5;
    this.icons.forEach((i) => {
      i.setPosition([x + space, y + this.height / 2 - i.getHeight() / 2]); //center of inventory container
      space += i.getWidth() + 5;
    });
    this.icons.forEach((i) => {
      i.render(ctx);
    });
  }
}
