import Phaser from "phaser";
import { AIUnit, MainCharactor } from "../logic/unit";
import * as card from "../logic/card";
import { Card, Action } from "../logic/interfaces";
import { Combat } from "../logic/combat";
import { log } from "../logic/logger";
import * as csp from "../lib/csp";

const GROUND_KEY = "ground";
const DUDE_KEY = "dude";
const STAR_KEY = "star";
const BOMB_KEY = "bomb";

export default class CombatScene extends Phaser.Scene {
  gameOver = false;
  combat: Combat;
  // @ts-expect-error
  enermy: Phaser.GameObjects.GameObject;
  handCards: Phaser.GameObjects.GameObject[] = [];

  userAction = new csp.UnbufferredChannel<Action>();

  constructor() {
    super("game-scene");

    const robber1 = new AIUnit("强盗1", {
      drawPile: [new card.Attack2(), new card.Attack2()],
      equipped: [new card.Health(1)],
    });
    const robber2 = new AIUnit("强盗2", {
      drawPile: [
        new card.Attack3(),
        new card.Attack3(),
        new card.FollowUpAttack(),
      ],
      equipped: [new card.Health(5)],
    });

    const userCardSelection = new csp.UnbufferredChannel<any>();
    const userControlFunctions = {
      getChoiceFromUser: async function () {
        return userCardSelection.pop();
      },
    };

    const mainC = new MainCharactor(
      "主角",
      {
        drawPile: [new card.Attack1(), new card.Attack1(), new card.Heal()],
        equipped: [new card.Health(5)],
      },
      // new csp.UnbufferredChannel<string>(),
      // userControlFunctions,
      {
        actions: this.userAction,
      }
    );
    // Start the campagin
    this.combat = new Combat(mainC, robber1);
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image(GROUND_KEY, "assets/platform.png");
    this.load.image(STAR_KEY, "assets/star.png");
    this.load.image(BOMB_KEY, "assets/bomb.png");

    this.load.spritesheet(DUDE_KEY, "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  async create() {
    this.combat.begin();
    this.add.image(400, 300, "sky");
    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.gameControlLoop(this.combat);
  }

  async gameControlLoop(combat: Combat) {
    while (true) {
      // let state = await combat.onStateChange().pop();
      let state = await combat.participantA.waitForTurn();
      const handCards = await this.refreshHandCards(this, this.combat);
      const enermy = await this.refreshEnermy(this, this.combat);
      const overlapCollider = this.physics.add.overlap(
        handCards,
        enermy,
        async (handCard, enermy) => {
          let pointer = this.input.activePointer;
          if (!pointer.isDown) {
            // submit an action to the combat.
            let action: Action = {
              from: this.combat.getUnitOfThisTurn(),
              to: this.combat.getOpponent(),
              card: handCard.getData("model"),
            };
            console.log(action);
            handCard.destroy();
            await this.userAction.put(action);
            overlapCollider.destroy();
            Phaser.Actions.Call(
              handCards.getChildren(),
              (child) => {
                console.log(child);
                console.log(345789349758);
                // child.setInteractive(false);
              },
              null
            );
          }
        }
      );
    }
  }

  async refreshHandCards(
    scene: Phaser.Scene,
    combat: Combat
  ): Promise<Phaser.GameObjects.Group> {
    // reset hand cards references
    for (let card of this.handCards) {
      card.destroy();
    }
    this.handCards = [];

    const hand = combat.getUnitOfThisTurn().cards.hand;
    console.log(hand);
    const cards: Phaser.GameObjects.Container[] = [];
    for (let i = 0; i < hand.length; i++) {
      const width = 90;
      const cardContainer = this.add.container(200 + width * i, 550);
      const rect = this.add.rectangle(0, 0, width, 148, 0x6666ff);
      rect.setStrokeStyle(4, 0xefc53f);
      const text = this.add.text(0, 0, hand[i].name);
      cardContainer.add(rect);
      cardContainer.add(text);

      console.log(cardContainer);
      cardContainer.setInteractive();
      this.input.setDraggable(cardContainer);
      cards.push(cardContainer);
      cardContainer.setData("model", hand[i]);
      // console.log(rect);
      this.physics.add.existing(cardContainer);
      this.handCards.push(cardContainer);
    }
    return new Phaser.GameObjects.Group(scene, cards);
  }

  async refreshEnermy(
    scene: Phaser.Scene,
    combat: Combat
  ): Promise<Phaser.GameObjects.Rectangle> {
    if (this.enermy) {
      this.enermy.destroy();
    }
    // const enermy = combat.getOpponent();
    const enermy = this.add.rectangle(600, 250, 74, 148, 0x6666ff);
    this.add.text(580, 200, "敌人");
    this.enermy = enermy;
    enermy.setInteractive();
    this.physics.add.existing(enermy);
    return enermy;
  }
  update() {}
}
