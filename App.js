import GameUI from "./GameUI.js";
import GameplayScreen from "./GameplayScreen";
import SelectedInventory from "./SelectedInventory";
import Turret from "./src/actor/Turret.js";
import IconList from "./src/common/IconList.js";
import Icon from "./src/common/Icon.js";
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
