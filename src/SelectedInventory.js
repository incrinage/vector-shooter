export default class SelectedInventory {
  constructor() {
    this.selectedItem = undefined;
  }

  getSelected() {
    return this.selectedItem;
  }
  setSelected(s) {
    this.selectedItem = s;
  }

  reset() {
    this.selectedItem = undefined;
  }
}
