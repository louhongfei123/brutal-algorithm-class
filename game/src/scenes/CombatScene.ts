import Phaser from "phaser";
import { AIUnit, MainCharactor } from "../logic/unit";
import * as card from "../logic/card";
import { Card, Action } from "../logic/interfaces";
import { Combat } from "../logic/combat";

import * as csp from "../lib/csp";
import * as physics from "../physics";
import { Deque } from "../logic/math";
import * as units from "../units";


export default class CombatScene extends Phaser.Scene {
  combats: Combat[];
  currentCombatIndex: number = 0;
  // @ts-expect-error
  enermyContainer: Phaser.GameObjects.GameObject;
  // @ts-expect-error
  playerContainer: Phaser.GameObjects.Container;
  handCards: Phaser.GameObjects.GameObject[] = [];

  userAction = new csp.UnbufferredChannel<Action>();
  readonly cardWidth = 90;
  readonly cardHeight = 148;

  constructor() {
    super("game-scene");
  
    const drawPile = new Deque<Card>(
      new card.Attack1(),
      new card.Attack1(),
      // new card.Attack2(),
      // new card.Heal(),
      // new card.QiFlow()
    );
    console.log(drawPile);
    drawPile.last();
    const mainC = new MainCharactor(
      "主角",
      {
        drawPile: drawPile,
        equipped: new Deque(new card.Health(100)),
      },
      {
        actions: this.userAction,
      }
    );
    // Start the campagin
    this.combats = [
      new Combat(mainC, units.SchoolBully()),
      // new Combat(mainC, units.EliteInternalDisciple())
    ]
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("girl_1", "assets/girl_1.png");
    this.load.image("girl_2", "assets/girl_2.png");
  }

  async create() {
    this.currentCombat().begin();
    this.add.image(400, 300, "sky");
    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.gameControlLoop();
  }

  async gameControlLoop() {
    while (true) {
      await csp.select(
        [
          [this.currentCombat().participantA.waitForTurn(), async (state) => {
            const { handCards, enermy, player } = await this.refresh();
            console.log(this.currentCombat().participantA);
            const overlapListener = async (handCard, target) => {
              let pointer = this.input.activePointer;
              if (!pointer.isDown) {
                // submit an action to the combat.
                let action: Action = {
                  from: this.currentCombat().getUnitOfThisTurn(),
                  to: target.getData("model"),
                  card: handCard.getData("model"),
                };
                console.log(action);
                handCard.destroy();
                overlapCollider1.destroy();
                overlapCollider2.destroy();
                await this.userAction.put(action);
              }
            }
            const overlapCollider1 = this.physics.add.overlap(handCards, enermy, overlapListener);
            const overlapCollider2 = this.physics.add.overlap(handCards, player, overlapListener);
          }],
          [this.currentCombat().participantB.waitForTurn(), async () => {
            const { handCards, enermy, player } = await this.refresh();
            const action = await this.currentCombat().participantB.observeActionTaken();
            // todo: render a card attack animation
            // https://phaser.io/examples
            console.log("enermy turn", action);
            // @ts-ignore
            const body: Phaser.Physics.Arcade.Body = enermy.body
            const cardPlayedByEnermy = this.renderCard(
              action.card,
              enermy.x,
              enermy.y,
              this.cardWidth,
              this.cardHeight)
            await physics.moveTo(
              this,
              cardPlayedByEnermy,
              { x: 400, y: 150 },
              200
            );
            await csp.sleep(1000);
            cardPlayedByEnermy.destroy();
          }],
          [this.currentCombat().waitForWinner(), async (unit) => {
            // console.log("winner", unit);
            // render
            const text = unit === this.currentCombat().participantA ?
              this.add.text(400, 200, 'Victory') : this.add.text(400, 200, 'Looser');
            text.setFontSize(70);
            text.setOrigin(0.5)
            await csp.sleep(2000);
            text.destroy();
            this.currentCombatIndex++;
            this.currentCombat().begin();
          }]
        ]
      );
    }
  }

  async refresh() {
    const handCards = await this.refreshHandCards(this, this.currentCombat());
    const enermy = await this.refreshEnermy(this, this.currentCombat());
    const player = await this.refreshPlayer(this, this.currentCombat());
    return { handCards, enermy, player }
  }

  renderCard(card: Card, x, y, width, height): Phaser.GameObjects.Container {
    // create a container
    const color = 0x6666ff;
    const cardContainer = this.add.container(x, y);

    // create children of the container
    const rect = this.add.rectangle(0, 0, width, height, color);
    rect.setStrokeStyle(4, 0xefc53f);
    console.log(card.name);
    const text = this.add.text(-35, -65, card.name);
    cardContainer.add(rect);
    cardContainer.add(text);

    // make the container interactive
    cardContainer.setSize(rect.width, rect.height);

    // add the container to the physics system
    this.physics.add.existing(cardContainer);
    cardContainer.setData("model", card);
    return cardContainer;
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

    const hand = combat.participantA.getHand();
    console.log(hand);
    for (let i = 0; i < hand.length; i++) {
      const cardContainer = this.renderCard(hand[i], 200 + this.cardWidth * i, 550, this.cardWidth, this.cardHeight);
      cardContainer.setInteractive();
      this.input.setDraggable(cardContainer);
      this.handCards.push(cardContainer);
    }
    return new Phaser.GameObjects.Group(scene, this.handCards);
  }

  async refreshEnermy(
    scene: Phaser.Scene,
    combat: Combat
  ): Promise<Phaser.GameObjects.Container> {
    if (this.enermyContainer) {
      this.enermyContainer.destroy();
    }
    const container = this.add.container(650, 250);

    // Add enermy image
    const enermy = this.add.image(0, 0, "girl_1");
    enermy.setScale(0.3);

    // Add enermy text
    const text = this.add.text(50, -75, combat.participantB.name);
    text.setFontSize(35);

    // Display enermy health point
    const health = combat.participantB.getHealth();
    const healthLimit = combat.participantB.getHealthLimit();
    const healthText = this.add.text(
      -enermy.width * enermy.scale / 4,
      -enermy.height * enermy.scale / 1.5,
      `${health}/${healthLimit}`
    );
    healthText.setFontSize(50);

    // Add parts to the container
    container.add(enermy)
    container.add(text)
    container.add(healthText)
    container.setData("model", combat.participantB);

    this.physics.add.existing(container);
    this.enermyContainer = container;
    return container;
  }

  async refreshPlayer(
    scene: Phaser.Scene,
    combat: Combat
  ): Promise<Phaser.GameObjects.Container> {
    if (this.playerContainer) {
      this.playerContainer.destroy();
    }
    const container = this.add.container(150, 250);

    // Add player image
    const player = this.add.image(0, 0, "girl_2");
    player.setScale(0.3);
    player.setInteractive();

    // Display health point
    const health = combat.participantA.getHealth();
    const healthLimit = combat.participantA.getHealthLimit();
    const healthText = this.add.text(
      -player.width * player.scale / 4,
      -player.height * player.scale / 1.8,
      `${health}/${healthLimit}`
    );
    healthText.setFontSize(50);

    container.add(healthText);
    container.add(player);
    container.setData("model", combat.participantA);
    this.physics.add.existing(container);
    this.playerContainer = container;
    return container;
  }

  currentCombat(): Combat {
    return this.combats[this.currentCombatIndex];
  }

  update() { }
}
