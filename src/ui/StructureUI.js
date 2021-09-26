import Turret from "../actor/Turret";
import Button from "../common/Button";
import Icon from "../common/Icon";
import IconList from "../common/IconList";
import UICanvas from "../common/UICanvas";

export default class StructureUI {
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
