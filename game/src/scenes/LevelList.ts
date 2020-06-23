import Phaser from "phaser";
import * as ui from "../ui";
import CombatScene from "./CombatScene";
import StoryScene from "./StoryScene";
import { MainCharactor } from "../logic/unit";
import * as card from "../logic/card";
import {
    Card, Action, EquippmentCard,
    Missed
} from "../logic/interfaces";
import { Combat } from "../logic/combat";

import * as csp from "../lib/csp";
import { Deque } from "../logic/math";
import * as units from "../units";
import * as playerHelper from "./player";
import * as enermyHelper from "./enermy";
import RewardScene from "./RewardScene";

export default class LevelListScene extends Phaser.Scene {

    constructor() {
        super(LevelListScene.name)
    }

    create() {

        const mainC = new MainCharactor(
            "Player",
            {
                deck: new Deque<Card>(
                    new card.Attack(3),
                    new card.Attack(4),
                ),
                equipped: new Deque<EquippmentCard>(
                    new card.Health(10),
                    new card.Agility(2)
                ),
            },
            {
                actions: csp.chan(),
                nextTurn: csp.chan(),
            }
        );
        // Start the campagin
        const levels = [
            new Combat(mainC, units.SchoolBully(),
                new Deque(
                    new card.Agility(5),
                    new card.Heal(),
                    new card.Health(10),
                )),
            new Combat(mainC, units.MartialArtBeginner(),
                new Deque()),
            new Combat(mainC, units.ExternalDisciple(),
                new Deque())
        ]

        let i = 0;
        for (let level of levels) {
            const button = ui.button(this, `Level ${++i}`, {
                x: ui.centerX(this),
                y: ui.centerY(this) * 0.2 * i,
                width: 300,
                height: 50,
                fontSize: 50
            });
            button.rect.on('pointerdown', () => {
                // this.scene.setVisible(false);
                const scene = new CombatScene(level)
                this.scene.add(CombatScene.name, scene, true);
            })
        }

    }

}

