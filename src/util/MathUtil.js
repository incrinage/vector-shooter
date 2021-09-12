export default /**
 * gets the angle between two points
 *
 * @param {number[]} [x0,y0]
 * @param {number[]} [xf,yf]
 * @returns
 */
function angle([x0, y0], [xf, yf]) {
  return 180 + (180 * Math.atan2(y0 - yf, x0 - xf)) / Math.PI;
}
