import * as ui from "../ui";
import LevelListScene from "./LevelList";
import { Game } from "../logic/game";

import Phaser from "phaser";
import StoryScene from "./StoryScene";
import { MainCharactor } from "../logic/unit_player";
import * as card from "../logic/card";
import {
    Card,
    EquippmentCard,
} from "../logic/interfaces";
import { Combat } from "../logic/combat";

import * as csp from "../lib/csp";
import { Deque } from "../logic/math";
import * as units from "../units";

export default class StartMenuScene extends Phaser.Scene {
    mainC = new MainCharactor(
        "Player",
        {
            deck: new Deque<Card>(
                new card.Attack(10),
                new card.Attack(4),
            ),
            equipped: new Deque<EquippmentCard>(
                new card.Health(10),
                new card.Agility(0),
            ),
        },
        {
            actions: csp.chan(),
            nextTurn: csp.chan(),
        },
    );

    gameState: Game = {
        compaingn: [
            new Combat(
                this.mainC,
                units.SchoolBully(),
                new Deque(
                    new card.Agility(5),
                    new card.Heal(),
                    new card.Health(10),
                ),
            ),
            new Combat(this.mainC, units.MartialArtBeginner(), new Deque()),
            new Combat(this.mainC, units.ExternalDisciple(), new Deque()),
        ],
    };

    constructor() {
        super("StartMenu");
        // Start the campagin
    }

    preload() {
        this.load.image("start-menu", "assets/start-menu.jpg");
    }

    create() {
        this.add
            .image(ui.centerX(this), ui.centerY(this), "start-menu")
            .setScale(1.7);
        const button = ui.button(this, "开始游戏", {
            x: ui.centerX(this),
            y: ui.centerY(this),
            width: 300,
            height: 80,
        });
        button.rect.on("pointerdown", async (pointer) => {
            const scene = new StoryScene(this.gameState);
            ui.transit(this, scene, StoryScene.name);
        });

        ui.button(this, "测试关卡", {
            x: ui.centerX(this),
            y: ui.centerY(this) * 1.2,
            width: 300,
            height: 80,
        })
            .rect.on("pointerdown", async (pointer) => {
                const scene = new LevelListScene(this.gameState);
                ui.transit(this, scene, LevelListScene.name)
            });

        ui.button(this, "制作人员", {
            x: ui.centerX(this),
            y: ui.centerY(this) * 1.4,
            width: 300,
            height: 80,
        });
    }
}
