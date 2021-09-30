import angle from "../util/MathUtil";

export default class StructureGrid {
  constructor(cellSideLength = 1, boundaries = [-1, 1, -1, 1], origin) {
    this.cellSideLength = cellSideLength;
    this.origin = origin;
    this.boundaries = boundaries;
    this.gridLocations = [];
  }

  /**
   * Returns the nearest coordinate on the grid from the
   * provided coordinate
   *
   * @param {number} x
   * @param {number} y
   * @return {number[]}
   */
  getGridCoordinate([x, y]) {
    return [
      Math.floor(x / this.cellSideLength) * this.cellSideLength,
      Math.floor(y / this.cellSideLength) * this.cellSideLength,
    ];
  }

  /**
   * Mark a space on the grid
   * @param {*} x
   * @param {*} y
   */
  add(coordinate, marker) {
    this.gridLocations.push({ coordinate, marker });
  }

  remove([x, y]) {
    this.gridLocations = this.gridLocations.filter((c) => {
      const { coordinate, marker } = c;
      const [xc, yc] = coordinate;
      if (xc != x || yc != y) {
        return true;
      }
      return false;
    });
  }

  isValidGridCoordinate([x, y]) {
    if (x % this.cellSideLength != 0 || y % this.cellSideLength != 0) {
      return false;
    }
    const [left, right, top, bottom] = this.boundaries;

    if (
      x < left ||
      x + this.cellSideLength > right ||
      y < top ||
      y + this.cellSideLength > bottom
    ) {
      return false;
    }

    return true;
  }

  isOccupied([x, y]) {
    let isOccupied = false;
    this.gridLocations.forEach((c) => {
      const { coordinate, marker } = c;
      const [xc, yc] = coordinate;
      if (xc == x && yc == y) {
        isOccupied = true;
        return;
      }
    });
    return isOccupied;
  }

  /**
   * Generates a path using the provided rules for
   * objects in the grid
   *
   * @param {number[]} start
   * @param {number[]} end
   * @param {Map<Class,Predicate>} pathRules
   */
  getPath(start, end, pathRules) {
    const [x0, y0] = this.getGridCoordinate(start);
    const [xf, yf] = this.getGridCoordinate(end);

    return [xf - x0, yf - f0, angle([x0, y0], [xf, yf])];
  }

  render(ctx) {
    const [x, y] = this.origin;
    const [left, right, top, bottom] = this.boundaries;
    const width = left - right;
    const height = top - bottom;
    ctx.strokeStyle = "black";
    ctx.strokeRect(x - width / 2, y - width / 2, width, height);
  }
}
