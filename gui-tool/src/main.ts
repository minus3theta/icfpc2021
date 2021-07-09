import 'phaser';
import {MainScene} from "./scenes/mainScene";

export const fps: number = 24;

const config: Phaser.Types.Core.GameConfig = {
  title: 'gui-tool',
  version: '1.0.0',
  width: 500,
  height: 500,
  parent: 'game',
  type: Phaser.AUTO,
  backgroundColor: 0xF9F9FF,
  scene: [
    MainScene
  ],
  fps: { target: fps, forceSetTimeOut: true },
  dom: {
    createContainer: true
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

const game = new Game(config);
