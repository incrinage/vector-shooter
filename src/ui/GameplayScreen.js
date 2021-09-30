import StructureGrid from "../common/StructureGrid";

export default class GameplayScreen {
  constructor(selectedInventory) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.canvas.className = "gameplayScreen";
    this.camera = {
      cameraDeltaX: 0,
      cameraDeltaY: 0,
      scale: 1,
      scaleExponent: 0,
    };
    this.origin = [0, 0];
    this.renderQueue = [];
    const cellLen = 32;
    this.grid = new StructureGrid(
      cellLen,
      [cellLen * -16, cellLen * 16, cellLen * -16, cellLen * 16],
      this.origin
    );

    this.selectedHighltColor = "green";

    //center coordinate system
    const [x, y] = this.origin;
    this.ctx.translate(x, y);
    this.selectedInventory = selectedInventory;
    this.initScreenListeners();
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.ctx;
  }

  clearScreen(xOrigin, yOrigin) {
    //scale
    const { x, y } = {
      x:
        xOrigin * this.camera.scale -
        this.camera.cameraDeltaX * this.camera.scale,
      y:
        yOrigin * this.camera.scale -
        this.camera.cameraDeltaY * this.camera.scale,
    };

    //update line width
    this.ctx.lineWidth = 1 * this.camera.scale;

    //clear only what is visible
    this.ctx.clearRect(
      x,
      y,
      this.canvas.width * this.camera.scale,
      this.canvas.height * this.camera.scale
    );
  }

  render() {
    const [x, y] = this.origin;
    this.clearScreen(x, y);
    const selected = this.selectedInventory.getSelected();
    if (selected) {
      const [xp, yp] = selected.getPosition();
      this.ctx.strokeStyle = this.selectedHighltColor;
      this.ctx.strokeRect(
        xp - selected.getWidth() / 2,
        yp - selected.getHeight() / 2,
        selected.getWidth(),
        selected.getHeight()
      );
      selected.render(this.ctx);
    }

    this.grid.render(this.ctx);
    this.renderQueue.forEach((o) => o.render(this.ctx));
  }

  initScreenListeners() {
    let ready = false;
    let mouseDownPoint = { x: 0, y: 0 };
    let mouseLocation = { x: 0, y: 0 };

    const enableScreenPan = (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      let x = e.x - canvasRect.left;
      let y = e.y - canvasRect.top;
      if (x > 0 && x < this.canvas.width && y > 0 && y < this.canvas.height) {
        ready = true;
        mouseDownPoint = { x, y };
      }
    };

    const disableScreenPan = () => {
      ready = false;
    };

    const zoom = (e) => {
      if (e.deltaY > 0 && this.camera.scaleExponent !== -1) {
        this.ctx.scale(2, 2); // doubles the size of translation and drawn objects
        this.camera.scaleExponent -= 1; //scale down translations by a power of 2
      } else if (e.deltaY < 0 && this.camera.scaleExponent !== 2) {
        this.ctx.scale(0.5, 0.5); // halves the size of translations and drawn objects
        this.camera.scaleExponent += 1; //scale up translations by a power of 2
      }

      this.camera.scale = Math.pow(2, this.camera.scaleExponent);

      updateMouseLocation(e);
      updateSelectedItemPosition();
    };

    const panScreen = (e) => {
      if (ready) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = e.x - canvasRect.left;
        const y = e.y - canvasRect.top;
        const xT = x - mouseDownPoint.x;
        const yT = y - mouseDownPoint.y;

        //scale the translation to accomadate to the zoom
        const scaledTranslation = {
          x: xT * this.camera.scale,
          y: yT * this.camera.scale,
        };

        //translate origin by xT, yT
        this.ctx.translate(scaledTranslation.x, scaledTranslation.y);

        //translate the mouse down point
        mouseDownPoint.x += xT;
        mouseDownPoint.y += yT;

        //capture total translation to clear canvas viewport
        this.camera.cameraDeltaX += xT;
        this.camera.cameraDeltaY += yT;
      }
    };

    const updateSelectedItemPosition = (e) => {
      const selected = this.selectedInventory.getSelected();
      if (selected) {
        const { isOccupied, isValid } =
          getIsOccupiedAndIsValidAndCoordinates(selected);
        if (isOccupied || !isValid) {
          this.selectedHighltColor = "red";
        } else {
          this.selectedHighltColor = "green";
        }
        selected.setPosition(
          this.grid.getGridCoordinate([mouseLocation.x, mouseLocation.y])
        );
      }
    };

    const updateMouseLocation = (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const x = e.x - canvasRect.left;
      const y = e.y - canvasRect.top;
      const [xo, yo] = this.origin;
      mouseLocation.x =
        (x - xo) * this.camera.scale -
        this.camera.cameraDeltaX * this.camera.scale;
      mouseLocation.y =
        (y - yo) * this.camera.scale -
        this.camera.cameraDeltaY * this.camera.scale;
    };

    this.canvas.addEventListener("mousemove", updateMouseLocation);
    this.canvas.addEventListener("mousemove", updateSelectedItemPosition);
    this.canvas.addEventListener("mousedown", enableScreenPan);
    this.canvas.addEventListener("mouseup", disableScreenPan);
    this.canvas.addEventListener("mousewheel", zoom);
    this.canvas.addEventListener("mousemove", panScreen);

    const getOccupiedCells = (coordinate, width, height, len) => {
      const [x, y] = coordinate;

      let xEnd = x + width;
      let yEnd = y + height;

      const result = [];
      for (let i = x; i < xEnd; i += len) {
        for (let j = y; j < yEnd; j += len) {
          result.push([i, j]);
        }
      }
      return result;
    };

    //can be done in grid class
    const isOccupied = (coordinates) => {
      let result = false;

      coordinates.forEach((c) => {
        const [cx, cy] = c;

        if (this.grid.isOccupied([cx, cy])) {
          result = true;
          return;
        }
      });
      return result;
    };

    const getIsOccupiedAndIsValidAndCoordinates = (actor) => {
      const gridLocation = this.grid.getGridCoordinate([
        mouseLocation.x,
        mouseLocation.y,
      ]);

      //can be called from Grid class
      const coordinates = getOccupiedCells(
        gridLocation,
        actor.getWidth(),
        actor.getHeight(),
        this.grid.cellSideLength
      );

      //can be called from Grid class and return the invalid locations
      let isValid = true;
      coordinates.forEach((c) => {
        if (!this.grid.isValidGridCoordinate(c)) {
          isValid = false;
          return;
        }
      });

      return { isOccupied: isOccupied(coordinates), isValid, coordinates };
    };

    this.canvas.addEventListener("click", (e) => {
      const selected = this.selectedInventory.getSelected();
      if (selected) {
        var { isOccupied, isValid, coordinates } =
          getIsOccupiedAndIsValidAndCoordinates(selected);

        if (!isOccupied && isValid) {
          coordinates.forEach((c) => {
            this.grid.add(c, 0);
          });
          this.renderQueue.push(selected);
          this.selectedInventory.reset();
        }
      }
    });
  }
}
