import Phaser from "phaser";
import StartMenuScene from "./scenes/StartMenuScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1600,
  height: 1200,
  physics: {
    default: "arcade",
  },
  scene: [StartMenuScene],
};

export default new Phaser.Game(config);
