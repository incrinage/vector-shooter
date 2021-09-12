import intersect from "./AbstractActor";

export default class Actor {
  constructor(
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    radius = 1,
    mass = 0
  ) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.mass = mass;
    this.active = true;
    this.health = 1;
  }

  onCollision() {}

  intersect(o) {
    return intersect(this, o);
  }

  getPosition() {
    return this.position;
  }

  setPosition(v) {
    this.position = v;
  }

  setVelocity(v) {
    this.velocity = v;
  }

  getVelocity() {
    return this.velocity;
  }

  getRadius() {
    return this.radius;
  }

  getMass() {
    return this.mass;
  }

  update() {}

  render() {}

  isActive() {
    return this.active;
  }
}
