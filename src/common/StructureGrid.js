import angle from "./MathUtil";

export default class BuildingGrid {
  constructor(width = 1, height = 1, squareSize = 1) {
    this.width = width;
    this.height = height;
    this.squareSize = squareSize;

    //initialize grid positions with empty arrays of objects
    this.grid = Array(Math.floor(width / squareSize));
    this.grid.forEach((col) => {
      col = Array(Math.floor(height / squareSize));
    });
  }

  /**
   * Returns the coordinate of the square
   * the parameters lie on
   *
   *
   * @param {number} x
   * @param {number} y
   * @return {number[]}
   */
  getPosition([x, y]) {
    return [Math.floor(x / this.squareSize), Math.floor(y / this.squareSize)];
  }

  /**
   * Add an object to the grid
   * by passing a coordinate within the grid's
   * dimensions
   * @param {*} x
   * @param {*} y
   */
  add([x, y], o) {
    const [xg, yg] = this.getPosition(x, y);
    this.grid[xg][yg] = o;
    this.grid[xg + o];
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
    const [x0, y0] = this.getPosition(start);
    const [xf, yf] = this.getPosition(end);

    return [xf - x0, yf - f0, angle([x0, y0], [xf, yf])];
  }

  draw() {}
}
