import Phaser from "phaser";

// import HelloWorldScene from './scenes/HelloWorldScene';
import CombatScene from "./scenes/CombatScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1600,
  height: 1200,
  physics: {
    default: "arcade",
  },
  scene: [CombatScene],
};

export default new Phaser.Game(config);
