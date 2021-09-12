export default function intersect(a, o) {
  if (!a || !o || a == o) {
    return false;
  }
  const [x, y, deg] = a.getPosition();
  const [ox, oy, odeg] = o.getPosition();
  return (
    Math.pow(x - ox, 2) + Math.pow(y - oy, 2) <=
    Math.pow(a.getRadius() + o.getRadius(), 2)
  );
}

export function force(a, o) {}

export function onCollision(collisions, actors) {
  collisions.forEach((c) => {
    const [a, b] = c;
    a.onCollision(b, actors);
    b.onCollision(a, actors);
  });
}

export function checkCollisions(a, b) {
  const collisions = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const a1 = a[i],
        a2 = b[j];

      //equals method
      if (a1 != a2 && a1.intersect(a2)) {
        collisions.push([a1, a2]);
      }
    }
  }

  return collisions;
}
