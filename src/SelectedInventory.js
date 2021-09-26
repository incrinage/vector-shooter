export default class SelectedInventory {
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
