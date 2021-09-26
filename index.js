(function () {
  'use strict';

  class Button {
    constructor([x = 0, y = 0], width, height, color, text) {
      this.position = [x, y];
      this.width = width;
      this.height = height;
      this.color = color;
      this.text = text;
    }

    getWidth() {
      return this.width;
    }

    getHeight() {
      return this.height;
    }

    getPosition() {
      return this.position;
    }

    render(ctx) {
      const [x, y] = this.position;
      ctx.font = "12px serif";
      ctx.clearRect(x, y, this.width, this.height);
      ctx.strokeRect(x, y, this.width, this.height);

      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, this.width, this.height);

      this.renderText(ctx);
    }

    renderText(ctx) {
      const [x, y] = this.position;
      ctx.strokeStyle = "black";
      ctx.strokeText(this.text, x, y + this.getHeight() / 2);
    }
  }

  class InventoryButton extends Button {
    constructor([x = 0, y = 0], width, height) {
      super([x, y], width, height, "#a3e4f7", "Inventory");
    }
  }

  class UICanvas {
    constructor(width, height) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.className = "gameUI";
      this.ctx = this.canvas.getContext("2d", { alpha: false });
    }

    getCanvas() {
      return this.canvas;
    }

    getContext() {
      return this.ctx;
    }
  }

  function intersect(a, o) {
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

  class Actor {
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

  /**
   * gets the angle between two points
   *
   * @param {number[]} [x0,y0]
   * @param {number[]} [xf,yf]
   * @returns
   */
  function angle$1([x0, y0], [xf, yf]) {
    return 180 + (180 * Math.atan2(y0 - yf, x0 - xf)) / Math.PI;
  }

  function add(vector1, vector2) {
    const result = [];
    vector1.forEach((v, i) => {
      result.push(v + vector2[i]);
    });
    return result;
  }

  class Bullet extends Actor {
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
        const ang = angle$1([x, y], [tx, ty]);
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

  class Turret extends Actor {
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

  class Icon {
    /**
     * Creates an Icon representing an object that can be created
     * The class must be an Actor
     *
     * @param {*} objectClass
     */
    constructor(objectClass) {
      this.width = 25;
      this.height = 25;
      this.position = [0, 0];
      this.objectClass = objectClass;
    }

    setPosition(pos) {
      this.position = pos;
    }

    getPosition() {
      return this.position;
    }

    getWidth() {
      return this.width;
    }

    getHeight() {
      return this.height;
    }

    getObject() {
      return new this.objectClass();
    }

    getClass() {
      return this.objectClass;
    }

    render(ctx) {
      const [x, y] = this.position;
      ctx.strokeStyle = "green";
      ctx.strokeRect(x, y, this.width, this.height);
    }
  }

  class IconList {
    constructor(position, width, height) {
      this.position = position;
      this.width = width;
      this.height = height;
      this.icons = [];
    }

    add(item) {
      this.icons.push(item);
    }

    getWidth() {
      return this.width;
    }

    getHeight() {
      return this.height;
    }

    forEach(fn) {
      this.icons.forEach(fn);
    }

    render(ctx) {
      const [x, y] = this.position;
      let space = 5;
      this.icons.forEach((i) => {
        i.setPosition([x + space, y + this.height / 2 - i.getHeight() / 2]); //center of inventory container
        space += i.getWidth() + 5;
      });
      this.icons.forEach((i) => {
        i.render(ctx);
      });
    }
  }

  class StructureUI {
    constructor(selectedInventory) {
      this.container = new UICanvas(512, 128);

      this.structureIcons = new IconList([0, 0], 500, 100);
      this.structureIcons.add(new Icon(Turret));
      this.selectedInventory = selectedInventory;

      this.closeBtn = new Button([470, 0], 30, 30, "gray", "X");

      const canvas = this.container.getCanvas();
      canvas.classList.add("structure-ui");
      canvas.classList.add("hidden");

      this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
      this.iconClick = this.iconClick.bind(this);

      canvas.addEventListener("click", this.onCloseButtonClick.bind(this));
      canvas.addEventListener("click", this.iconClick.bind(this));
    }

    onCloseButtonClick(e) {
      const canvas = this.container.getCanvas();
      const canvasRect = canvas.getBoundingClientRect();
      const x = e.x - canvasRect.left;
      const y = e.y - canvasRect.top;
      const [ix, iy] = this.closeBtn.getPosition();
      if (
        x >= ix &&
        x <= ix + this.closeBtn.getWidth() &&
        y >= iy &&
        y <= iy + this.closeBtn.getHeight()
      ) {
        canvas.classList.add("hidden");
        this.selectedInventory.reset();
      }
    }

    iconClick(e) {
      const canvas = this.container.getCanvas();
      const canvasRect = canvas.getBoundingClientRect();
      const x = e.x - canvasRect.left;
      const y = e.y - canvasRect.top;
      this.structureIcons.forEach((i) => {
        const [ix, iy] = i.getPosition();
        if (
          x >= ix &&
          x <= ix + i.getWidth() &&
          y >= iy &&
          y <= iy + i.getHeight()
        ) {
          if (this.selectedInventory.getSelected() instanceof i.getClass()) {
            this.selectedInventory.setSelected(undefined);
            this.selectedInventory.ready = false;
          } else {
            this.selectedInventory.setSelected(i.getObject());
            this.selectedInventory.ready = true;
          }
        }
      });
    }

    getCanvas() {
      return this.container.getCanvas();
    }

    render() {
      const ctx = this.container.getContext();
      this.closeBtn.render(ctx);
      this.structureIcons.render(ctx);
    }
  }

  class GameUI {
    constructor(selectedInventory) {
      this.canvasElements = [];
      this.renderQueue = [];
      this.selectedInventory = selectedInventory;

      this.structureUI = new StructureUI(selectedInventory);
      this.init();
    }

    init() {
      const structuresBtn = new InventoryButton([0, 0], 50, 50);
      const structuresBtnContainer = new UICanvas(50, 50);
      const structuresBtnCanvas = structuresBtnContainer.getCanvas();
      structuresBtnCanvas.classList.add("inventory-btn");
      this.renderQueue.push({
        render: () => {
          structuresBtn.render(structuresBtnContainer.getContext());
        },
      });

      const showInventory = () => {
        this.structureUI.getCanvas().classList.remove("hidden");
      };
      structuresBtnCanvas.addEventListener("click", showInventory);

      this.canvasElements.push(structuresBtnCanvas);
      this.canvasElements.push(this.structureUI.getCanvas());
    }

    getAllCanvasElements() {
      return this.canvasElements;
    }

    render() {
      this.renderQueue.forEach((o) => {
        o.render();
      });

      this.structureUI.render();
    }
  }

  class SelectedInventory {
    constructor() {
      this.selectedItem = undefined;
      this.ready = false;
    }

    getSelected() {
      return this.selectedItem;
    }
    setSelected(s) {
      this.selectedItem = s;
    }

    reset() {
      this.selectedItem = undefined;
      this.ready = false;
    }
  }

  class StructureGrid {
    constructor(cellSideLength = 1, boundaries = [-1, 2, -1, 2]) {
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
      if (x < left || x > right || y < top || y > bottom) {
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

      return [xf - x0, yf - f0, angle$1([x0, y0], [xf, yf])];
    }

    render(ctx) {}
  }

  class GameplayScreen {
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
      this.grid = new StructureGrid(cellLen, [
        cellLen * -16,
        cellLen * 16,
        cellLen * -16,
        cellLen * 16,
      ]);

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
      if (selected && this.selectedInventory.ready) {
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
      this.canvas.addEventListener("mousemove", (e) => {
        const selected = this.selectedInventory.getSelected();
        if (selected) {
          this.selectedInventory.ready = true;
        }
      });
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
        let isValid = false;
        coordinates.forEach((c) => {
          if (this.grid.isValidGridCoordinate(c)) {
            isValid = true;
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

  const selectedInventory = new SelectedInventory();
  const gameUI = new GameUI(selectedInventory);
  const gameplayScreen = new GameplayScreen(selectedInventory);

  function render() {
    gameplayScreen.render();
    gameUI.render();
  }

  let lastTime = 0;
  function loop(t) {
    if (t - lastTime >= 16) {
      render();

      lastTime = t;
    }
    requestAnimationFrame(loop);
  }

  const gameContainer = document.getElementById("game-container");
  const uiCanvases = gameUI.getAllCanvasElements();
  uiCanvases.forEach((element) => {
    gameContainer.appendChild(element);
  });
  gameContainer.appendChild(gameplayScreen.getCanvas());

  loop();

}());
