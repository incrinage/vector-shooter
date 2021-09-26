import GameUI from "./ui/GameUI.js";
import SelectedInventory from "./SelectedInventory";
import GameplayScreen from "./ui/GameplayScreen.js";

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
