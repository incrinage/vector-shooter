import Actor from "./Actor";
import intersect from "./AbstractActor";
import angle from "../util/MathUtil";
import add from "../util/VectorUtil";

export default class Bullet extends Actor {
  constructor(
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    radius = 0,
    target = undefined
  ) {
    super(position, velocity, radius);
    this.target = target;
    this.dmg = 5;
    this.active = true;
  }

  force([mag, deg]) {
    this.setActive(false);
  }

  //add velocity to position
  update() {
    if (intersect(this, this.target)) {
      this.target.force([this.dmg, 0]);
      this.setActive(false);
      return;
    }

    const [x, y, deg] = this.position;
    if (this.target) {
      const [tx, ty, tdeg] = this.target.getPosition();
      const ang = angle([x, y], [tx, ty]);
      this.position = [x, y, ang];
    }
    const [px, py, pdeg] = this.position;
    const [vx, vy, vdeg] = this.velocity;
    this.position = add(this.position, [
      vx * Math.cos(pdeg * (Math.PI / 180)),
      vy * Math.sin(pdeg * (Math.PI / 180)),
      0,
    ]);
  }

  setActive(active) {
    this.active = active;
  }

  isActive() {
    return this.active;
  }

  intersect(o) {
    return false;
  }

  //draw bullet
  render(ctx) {
    ctx.save();
    const [x, y, deg] = this.position;

    ctx.translate(x, y);
    ctx.rotate(deg * (Math.PI / 180));
    ctx.strokeStyle = "black";
    ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(this.radius, 0);
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}
