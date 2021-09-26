import Button from "../common/Button";
import InventoryButton from "../common/InventoryButton";
import UICanvas from "../common/UICanvas";
import StructureUI from "./StructureUI";

export default class GameUI {
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
