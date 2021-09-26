import Actor from "./Actor";
import Bullet from "./Bullet";

export default class Turret extends Actor {
  constructor(
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    radius = 32,
    mass = radius
  ) {
    super(position, velocity, radius, mass);
    this.health = 1;
    this.targets = [];
    this.shotTime = 0;
  }

  getWidth() {
    return this.radius * 2;
  }

  getHeight() {
    return this.radius * 2;
  }
  setPosition([x, y]) {
    super.setPosition([x + this.radius, y + this.radius]);
  }

  //returns a bullet with the assigned position
  shoot(target) {
    const currTime = new Date().getTime();
    if (currTime - this.shotTime < 500) return;

    //aim
    const [x, y, deg] = this.position;
    const ang = angle(this.position, target.getPosition());
    this.setPosition([x, y, ang]);

    //bullet params
    const bulletRadius = 5;
    const bulletPosition = this.getBulletPosition(x, ang, bulletRadius, y);
    const bulletVelocity = [1, 1, 0];

    this.shotTime = currTime;

    return new Bullet(bulletPosition, bulletVelocity, bulletRadius, target);
  }

  getBulletPosition(x, ang, bulletRadius, y) {
    //place the bullet in front of a the turret
    //by getting the point on the turret circle and then adding the
    //bullet radius
    return [
      x +
        this.radius * Math.cos((ang * Math.PI) / 180) +
        bulletRadius * Math.cos((ang * Math.PI) / 180),
      y +
        this.radius * Math.sin((ang * Math.PI) / 180) +
        bulletRadius * Math.sin((ang * Math.PI) / 180),
      ang,
    ];
  }

  update() {
    if (this.health <= 0) {
      this.active = false;
    }
  }

  /**
   * The object is responsible for the way it treats force applied to it
   * @param {number[]} array
   */
  force([magnitude, deg]) {
    this.health -= magnitude;
  }

  addTarget(t) {
    this.targets.push(t);
  }

  //draw turret
  render(ctx) {
    const [x, y, deg] = this.getPosition();
    ctx.save();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.translate(x, y);
    ctx.rotate(deg * (Math.PI / 180));

    ctx.moveTo(0, 0);
    ctx.lineTo(this.radius, 0);
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}
