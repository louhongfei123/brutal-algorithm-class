import Phaser from "phaser";
import * as ui from "../ui";
import CombatScene from "./CombatScene";
import StoryScene from "./StoryScene";
import LevelListScene from "./LevelList";
import { isObject } from 'util';

export default class StartMenuScene extends Phaser.Scene {


    constructor() {
        super('StartMenu')
    }

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
            const scene = new StoryScene()
            ui.transit(this, scene, StoryScene.name)
        });

        ui.button(this, "测试关卡", {
            x: ui.centerX(this),
            y: ui.centerY(this) * 1.2,
            width: 300,
            height: 80
        })
            .rect.on('pointerdown', async (pointer) => {
                this.scene.setVisible(false);
                const scene = new LevelListScene()
                this.scene.add(LevelListScene.name, scene, true)
                // await scene.done();
            });

        ui.button(this, "制作人员", {
            x: ui.centerX(this),
            y: ui.centerY(this) * 1.4,
            width: 300,
            height: 80
        })
    }

}