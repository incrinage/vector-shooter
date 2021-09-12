export default function add(vector1, vector2) {
  const result = [];
  vector1.forEach((v, i) => {
    result.push(v + vector2[i]);
  });
  return result;
}
