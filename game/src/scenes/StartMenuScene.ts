import Phaser from "phaser";
import * as ui from "../ui";
import CombatScene from "./CombatScene";

export default class StartMenuScene extends Phaser.Scene {

    preload() {

        this.load.image("start-menu", "assets/start-menu.jpg");

    }

    create() {
        this.add
            .image(ui.centerX(this), ui.centerY(this), "start-menu")
            .setScale(1.7)
        const button = ui.button(this, "开始游戏", {
            x: ui.centerX(this),
            y: ui.centerY(this),
            width: 300,
            height: 80
        })
        button.rect.on('pointerdown', async (pointer) => {
            const scene = new CombatScene()
            this.scene.add('CombatScene', scene, true)
            await scene.done();
        });

        ui.button(this, "测试关卡", {
            x: ui.centerX(this), 
            y: ui.centerY(this) * 1.2, 
            width: 300, 
            height: 80
        })

        ui.button(this, "制作人员", {
            x: ui.centerX(this), 
            y: ui.centerY(this) * 1.4, 
            width: 300, 
            height: 80
        })

    }

}