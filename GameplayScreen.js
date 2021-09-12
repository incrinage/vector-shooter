export default class GameplayScreen {
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
        selected.setPosition([mouseLocation.x, mouseLocation.y]);
      }
    };

    const updateMouseLocation = (e) => {
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

    this.canvas.addEventListener("mousemove", updateMouseLocation);
    this.canvas.addEventListener("mousemove", updateSelectedItemPosition);
    this.canvas.addEventListener("mousedown", enableScreenPan);
    this.canvas.addEventListener("mouseup", disableScreenPan);
    this.canvas.addEventListener("mousewheel", zoom);
    this.canvas.addEventListener("mousemove", panScreen);
  }
}
