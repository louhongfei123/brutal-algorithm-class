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
  // @ts-ignore
  enermyContainer: Phaser.GameObjects.GameObject;
  // @ts-ignore
  playerContainer: Phaser.GameObjects.Container;
  handCards: Phaser.GameObjects.GameObject[] = [];

  userAction = new csp.UnbufferredChannel<Action>();
  readonly cardWidth = 90 * 2;
  readonly cardHeight = 148 * 2;

  constructor() {
    super("game-scene");
  
    const drawPile = new Deque<Card>(
      new card.Attack(3),
      new card.Attack(4),
      new card.QiFlow()
    );
    console.log(drawPile);
    drawPile.last();
    const mainC = new MainCharactor(
      "主角",
      {
        drawPile: drawPile,
        equipped: new Deque(new card.Health(20)),
      },
      {
        actions: this.userAction,
      }
    );
    // Start the campagin
    this.combats = [
      new Combat(mainC, units.SchoolBully()),
      new Combat(mainC, units.MartialArtBeginner()),
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
    let img = this.add.image(400 * 2, 300 * 2, "sky");
    img.setScale(2)
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
            console.log(this.currentCombat().participantA.getHand());
            console.log(this.currentCombat().participantA.getDrawPile());
            console.log(this.currentCombat().participantA.getDiscardPile());
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
            console.log(this.currentCombat().participantA.getHand());
            console.log(this.currentCombat().participantA.getDrawPile());
            console.log(this.currentCombat().participantA.getDiscardPile());
            // await csp.sleep(100000)
            const action = await this.currentCombat().participantB.observeActionTaken();
            // todo: render a card attack animation
            // https://phaser.io/examples
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
              { x: 400 * 2, y: 150 * 2 },
              400
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
    // todo: render draw pile
    const drawPile = await this.refreshDrawPile();
    const discardPile = this.refreshDiscardPile();
    // todo: render discard pile
    return { handCards, enermy, player, drawPile, discardPile }
  }

  refreshDrawPile() {
    const drawPile = this.currentCombat().participantA.getDrawPile();
    const container = this.add.container(this.sys.game.canvas.width, this.sys.game.canvas.height)
    const rect = this.add.rectangle(-100, -100, 150, 300, 0x6666ff)
    const count = this.add.text(-115, -150, `${drawPile.length}`)
    count.setFontSize(50)
    const name = this.add.text(-160, -220, `抽牌堆`)
    name.setFontSize(40)
    container.add(rect)
    container.add(count)
    container.add(name)
    return drawPile
  }

  refreshDiscardPile() {
    const pile = this.currentCombat().participantA.getDiscardPile();
    const container = this.add.container(this.sys.game.canvas.width, this.sys.game.canvas.height)
    const rect = this.add.rectangle(-300, -100, 150, 300, 0x6666ff)
    const count = this.add.text(-315, -150, `${pile.length}`)
    count.setFontSize(50)
    const name = this.add.text(-360, -220, `弃牌堆`)
    name.setFontSize(40)
    container.add(rect)
    container.add(count)
    container.add(name)
    return pile
  }

  renderCard(card: Card, x, y, width, height): Phaser.GameObjects.Container {
    // create a container
    const color = 0x6666ff;
    const cardContainer = this.add.container(x, y);

    // create children of the container
    const rect = this.add.rectangle(0, 0, width, height, color);
    rect.setStrokeStyle(4, 0xefc53f);
    const text = this.add.text(-70, -120, card.name);
    text.setFontSize(35)
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
      const cardContainer = this.renderCard(hand[i], 200*2 + this.cardWidth * i, 550 * 2, this.cardWidth, this.cardHeight);
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
    const container = this.add.container(650 * 2, 250 * 2);

    // Add enermy image
    const enermy = this.add.image(0, 0, "girl_1");
    enermy.setScale(0.6);

    // Add enermy text
    const text = this.add.text(50, -75, combat.participantB.name);
    text.setFontSize(70);

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
    const container = this.add.container(300, 500);

    // Add player image
    const player = this.add.image(0, 0, "girl_2");
    player.setScale(0.6);
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
