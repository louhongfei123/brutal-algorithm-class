import Phaser from "phaser";
import {
    Card,
    Action,
    EquippmentCard,
    Missed
} from "../logic/interfaces";
import { Combat } from "../logic/combat";
import * as ui from "../ui";

import CombatScene from "./CombatScene"

export function refreshHandCards(
    scene: CombatScene,
    combat: Combat
): Phaser.GameObjects.Group {
    // reset hand cards references
    for (let card of scene.handCards) {
        card.destroy();
    }
    scene.handCards = [];

    const hand = combat.player.getHand();
    for (let i = 0; i < hand.length; i++) {
        const cardContainer = ui.renderCard(scene, hand[i], 200 * 2 + scene.cardWidth * i, 550 * 2, scene.cardWidth, scene.cardHeight);
        cardContainer.setInteractive();
        scene.input.setDraggable(cardContainer);
        scene.handCards.push(cardContainer);
    }
    const handCardGroup = new Phaser.GameObjects.Group(scene, scene.handCards);
    return handCardGroup
}

export function refreshPlayer(
    scene: CombatScene,
    combat: Combat
): Phaser.GameObjects.Container {
    if (scene.playerContainer) {
        scene.playerContainer.destroy();
    }
    const container = scene.add.container(300, 500);

    // Add player image
    const player = scene.add.image(0, 0, "girl_2");
    player.setScale(0.6);
    player.setInteractive();

    // Display health point
    const health = combat.player.getHealth();
    const healthLimit = combat.player.getHealthLimit();
    const healthText = scene.add.text(
        -player.width * player.scale / 4,
        -player.height * player.scale / 1.8,
        `${health}/${healthLimit}`
    );
    healthText.setFontSize(50);

    container.add(healthText);
    container.add(player);
    container.setData("model", combat.player);
    scene.physics.add.existing(container);
    scene.playerContainer = container;
    return container;
}

export function refreshDrawPile(scene: CombatScene) {
    const drawPile = scene.currentCombat().player.getDrawPile();
    const container = scene.add.container(scene.sys.game.canvas.width, scene.sys.game.canvas.height)
    const rect = scene.add.rectangle(-100, -100, 150, 300, 0x6666ff)
    const count = scene.add.text(-115, -150, `${drawPile.length}`)
    count.setFontSize(50)
    const name = scene.add.text(-160, -220, `抽牌堆`)
    name.setFontSize(40)
    container.add(rect)
    container.add(count)
    container.add(name)
    return drawPile
}

export function refreshDiscardPile(scene: CombatScene) {
    const pile = scene.currentCombat().player.getDiscardPile();
    const container = scene.add.container(scene.sys.game.canvas.width, scene.sys.game.canvas.height)
    const rect = scene.add.rectangle(-300, -100, 150, 300, 0x6666ff)
    const count = scene.add.text(-315, -150, `${pile.length}`)
    count.setFontSize(50)
    const name = scene.add.text(-360, -220, `弃牌堆`)
    name.setFontSize(40)
    container.add(rect)
    container.add(count)
    container.add(name)
    return pile
}

export function setHandCardsInteractive(scene: CombatScene) {
    if (scene.currentCombat().getUnitOfThisTurn() === scene.currentCombat().player) {
        console.log('setHandCardsInteractive');
        const overlapListener = async (handCard, target) => {
            let pointer = scene.input.activePointer;
            if (!pointer.isDown) {
                // submit an action to the combat.
                let action: Action = {
                    from: scene.currentCombat().getUnitOfThisTurn(),
                    to: target.getData("model"),
                    card: handCard.getData("model"),
                };
                handCard.destroy();
                console.log(action, 'telling unit the action is taken');
                await scene.userAction.put(action);
                console.log('the unit has received the action');
            }
        }
        scene.enermyCollider = scene.physics.add.overlap(scene.handCardGroup, scene.enermyContainer, overlapListener);
        scene.playerCollider = scene.physics.add.overlap(scene.handCardGroup, scene.playerContainer, overlapListener);
        console.log(scene.enermyCollider);
    } else {
        throw new Error('impossible')
    }
}

///////////////
// Next Turn //
///////////////
export function renderNextTurnButton(scene: CombatScene) {
    const container = scene.add.container(0, scene.sys.game.canvas.height)
    const rect = scene.add.rectangle(150, -200, 250, 100, 0x6666ff)
    const name = scene.add.text(75, -220, `下一回合`)
    name.setFontSize(40)
    container.add(rect)
    container.add(name)

    rect.on('pointerdown', async (pointer) => {
        scene.nextTurnButton.rect.disableInteractive();
        console.log('clicked', ++i)
        console.log(scene.enermyCollider);
        scene.enermyCollider.destroy();
        scene.playerCollider.destroy();
        await scene.nextTurn.put(undefined);
    });

    return {
        conatiner: container,
        rect: rect
    }
}

let i = 0;
export function setNextTurnButtonInteractive(scene: CombatScene) {
    console.log('setNextTurnButtonInteractive');
    scene.nextTurnButton.rect.setInteractive()
}

