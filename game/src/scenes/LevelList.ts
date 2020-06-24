import Phaser from "phaser";
import * as ui from "../ui";
import CombatScene from "./CombatScene";
import { Game } from '../logic/game';

export default class LevelListScene extends Phaser.Scene {
    constructor(
        public gameState: Game,
    ) {
        super(LevelListScene.name);
    }

    create() {
        let i = 0;
        for (let combat of this.gameState.compaingn) {
            const button = ui.button(this, `Level ${++i}`, {
                x: ui.centerX(this),
                y: ui.centerY(this) * 0.2 * i,
                width: 300,
                height: 50,
                fontSize: 50,
            });
            if (!combat.hasWinner()) {
                // This level has not been won yet
                button.rect.on("pointerdown", () => {
                    ui.transit(this,
                        new CombatScene(combat, this.gameState),
                        CombatScene.name)
                });
            } else {
                // This level has been won.
                let text = this.add.text(button.conatiner.x + 250, button.conatiner.y, "已通关")
                text.setFontSize(50)
                text.setOrigin(0.5)
            }
        }
    }
}
