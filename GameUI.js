import Button from "./src/common/Button";
import UICanvas from "./src/common/UICanvas";

export default class GameUI {
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
