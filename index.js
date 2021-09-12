(function () {
  'use strict';

  class Button {
    constructor([x = 0, y = 0], width, height) {
      this.position = [x, y];
      this.width = width;
      this.height = height;
      this.color = "#a3e4f7";
      this.text = "Inventory";
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

      ctx.strokeStyle = "black";
      ctx.strokeText(this.text, x + 2, y + this.height / 2);
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

  class GameUI {
    constructor(selectedInventory, structures, troops) {
      this.canvasElements = [];
      this.renderQueue = [];
      this.selectedInventory = selectedInventory;
      this.structures = structures;
      this.troops = troops;
      this.init();
    }

    init() {
      const structuresBtn = new Button([0, 0], 50, 50);
      const structuresBtnContainer = new UICanvas(50, 50);
      const structuresBtnCanvas = structuresBtnContainer.getCanvas();
      structuresBtnCanvas.classList.add("inventory-btn");
      this.renderQueue.push(() => {
        structuresBtn.render(structuresBtnContainer.getContext());
      });
      structuresBtnCanvas.addEventListener("click", () => {
        structuresBtnCanvas.classList.add("hidden");
        structuresCanvas.classList.remove("hidden");
      });

      const structuresContainer = new UICanvas(500, 100);
      const structuresCanvas = structuresContainer.getCanvas();
      structuresCanvas.classList.add("hidden");
      this.renderQueue.push(() => {
        this.structures.render(structuresContainer.getContext());
      });
      structuresCanvas.addEventListener("click", (e) => {
        const canvasRect = structuresCanvas.getBoundingClientRect();
        const x = e.x - canvasRect.left;
        const y = e.y - canvasRect.top;
        this.structures.forEach((i) => {
          const [ix, iy] = i.getPosition();
          if (
            x >= ix &&
            ix <= x + i.getWidth() &&
            y >= iy &&
            iy <= y + i.getHeight()
          ) {
            if (this.selectedInventory.getSelected() instanceof i.getClass()) {
              this.selectedInventory.setSelected(undefined);
            } else {
              this.selectedInventory.setSelected(i.getObject());
            }
          }
        });
      });

      this.canvasElements.push(structuresBtnCanvas);
      this.canvasElements.push(structuresCanvas);
    }

    getAllCanvasElements() {
      return this.canvasElements;
    }

    render() {
      this.renderQueue.forEach((fn) => {
        fn();
      });
    }
  }

  class GameplayScreen {
    constructor(selectedInventory) {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d", { alpha: false });
      this.canvas.width = 1000;
      this.canvas.height = 1000;
      this.canvas.className = "gameplayScreen";
      this.camera = {
        cameraDeltaX: 0,
        cameraDeltaY: 0,
        scale: 1,
        scaleExponent: 0,
      };

      //center coordinate system
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.selectedInventory = selectedInventory;
      this.initScreenListeners();
    }

    getCanvas() {
      return this.canvas;
    }

    getContext() {
      return this.ctx;
    }

    clearScreen() {
      const { x, y } = {
        x:
          (-this.canvas.width * this.camera.scale) / 2 -
          this.camera.cameraDeltaX * this.camera.scale,
        y:
          (-this.canvas.height * this.camera.scale) / 2 -
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
      this.clearScreen();
      const selected = this.selectedInventory.getSelected();
      if (selected) {
        selected.render(this.ctx);
      }
    }

    initScreenListeners() {
      let ready = false;
      let mouseDownPoint = { x: 0, y: 0 };
      let mouseLocation = { x: 0, y: 0 };

      const enablePanOnMouseMove = (e) => {
        const canvasRect = this.canvas.getBoundingClientRect();
        let x = e.x - canvasRect.left;
        let y = e.y - canvasRect.top;
        if (x > 0 && x < this.canvas.width && y > 0 && y < this.canvas.height) {
          ready = true;
          mouseDownPoint = { x, y };
        }
      };
      const disablePanOnMouseMove = () => {
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
      };

      const panOnMouseDown = (e) => {
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

      const showSelectedItemOnMouseMove = (e) => {
        const selected = this.selectedInventory.getSelected();
        const canvasRect = this.canvas.getBoundingClientRect();
        e.x - canvasRect.left;
        e.y - canvasRect.top;
        if (selected) {
          selected.setPosition([mouseLocation.x, mouseLocation.y]);
        }
      };

      const setTranslatedMouseLocation = (e) => {
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = e.x - canvasRect.left;
        const y = e.y - canvasRect.top;

        mouseLocation.x =
          (x - this.canvas.width / 2) * this.camera.scale -
          this.camera.cameraDeltaX * this.camera.scale;
        mouseLocation.y =
          (y - this.canvas.height / 2) * this.camera.scale -
          this.camera.cameraDeltaY * this.camera.scale;
      };

      this.canvas.addEventListener("mousemove", setTranslatedMouseLocation);
      this.canvas.addEventListener("mousemove", showSelectedItemOnMouseMove);
      this.canvas.addEventListener("mousedown", enablePanOnMouseMove);
      this.canvas.addEventListener("mouseup", disablePanOnMouseMove);
      this.canvas.addEventListener("mousewheel", zoom);
      this.canvas.addEventListener("mousemove", panOnMouseDown);
    }
  }

  class SelectedInventory {
    constructor() {
      this.selectedItem = undefined;
    }

    getSelected() {
      return this.selectedItem;
    }
    setSelected(s) {
      this.selectedItem = s;
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
      radius = 5,
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

  class IconList {
    constructor(position, width, height) {
      this.position = position;
      this.width = width;
      this.height = height;
      this.icons = [];
    }

    add(item) {
      this.icons.push(item);
      const [x, y] = this.position;
      let space = 5;

      this.icons.forEach((i) => {
        i.setPosition([x + space, y + this.height / 2 - i.getHeight() / 2]); //center of inventory container
        space += i.getWidth() + 5;
      });
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
      ctx.strokeRect(x, y, this.width, this.height);

      this.icons.forEach((i) => {
        i.render(ctx);
      });
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

  const selectedInventory = new SelectedInventory();

  const structureList = new IconList([0, 0], 500, 100);
  structureList.add(new Icon(Turret));

  const gameUI = new GameUI(selectedInventory, structureList);
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
