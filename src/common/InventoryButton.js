import Button from "./Button";

export default class InventoryButton extends Button {
  constructor([x = 0, y = 0], width, height) {
    super([x, y], width, height, "#a3e4f7", "Inventory");
  }
}
