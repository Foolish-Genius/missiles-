import { Game } from "./core/Game.js";

const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #game-canvas element.");
}

const game = new Game(canvas);
game.start();
