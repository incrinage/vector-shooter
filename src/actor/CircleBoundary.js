import Actor from "./Actor";
export default class CircleBoundary extends Actor {
  constructor(target, radius) {
    super();
    this.target = target;
    super.radius = radius;
  }

  update() {
    if (!this.target.isActive()) {
      this.active = false;
    }
  }

  getPosition() {
    return this.target.getPosition();
  }

  intersect = function (o) {
    if (o === this.target) {
      return false;
    }

    const [x, y, deg] = this.target.getPosition();
    const [ox, oy, odeg] = o.getPosition();

    return (
      Math.pow(x - ox, 2) + Math.pow(y - oy, 2) <=
      Math.pow(this.radius + o.getRadius(), 2)
    );
  };

  onCollision = function (o, actors) {
    //target system will take care of this
    const bullet = this.target.shoot(o);
    if (bullet) actors.push(bullet);
  };

  render(ctx) {
    const [x, y, deg] = this.target.getPosition();
    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.arc(x, y, this.getRadius(), 0, 2 * Math.PI);
    ctx.stroke();
  }
}
