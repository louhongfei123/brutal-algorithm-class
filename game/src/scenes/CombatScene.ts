import Phaser from "phaser";
import { MainCharactor } from "../logic/unit";
import * as card from "../logic/card";
import {
  Card, Action, EquippmentCard,
  Missed
} from "../logic/interfaces";
import { Combat } from "../logic/combat";

import * as csp from "../lib/csp";
import * as ui from "../ui";
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
  // @ts-ignore
  playerCollider: Phaser.Physics.Arcade.Collider;
  // @ts-ignore
  enermyCollider: Phaser.Physics.Arcade.Collider;

  userAction = new csp.UnbufferredChannel<Action>();
  nextTurn = new csp.UnbufferredChannel<undefined>();
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
        equipped: new Deque<EquippmentCard>(
          new card.Health(20),
          new card.Agility(50)
        ),
      },
      {
        actions: this.userAction,
        nextTurn: this.nextTurn,
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
    this.renderNextTurnButton();
    this.gameControlLoop();
  }

  async gameControlLoop() {
    for await (let change of this.currentCombat().onStateChange()) {
      const combat = this.currentCombat();
      const u = combat.getUnitOfThisTurn();
      const { handCards, enermy, player } = await this.refresh();
      if (combat.hasWinner()) {
        console.log('hasWinner')
        const text =
          this.currentCombat().hasWinner() === this.currentCombat().player ?
            this.add.text(400, 200, 'Victory') : this.add.text(400, 200, 'Looser');
        text.setFontSize(70);
        text.setOrigin(0.5);
        await csp.sleep(2000);
        text.destroy();
        this.currentCombatIndex++;
        this.currentCombat().begin();
      }
      else if (u === combat.enermy) {
        console.log('combat.getUnitOfThisTurn() === combat.participantB')
        const action = await combat.enermy.observeActionTaken();
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
        await ui.moveTo(
          this,
          cardPlayedByEnermy,
          { x: 400 * 2, y: 150 * 2 },
          400
        );
        await csp.sleep(1000);
        const isMissed = combat.enermy.commit(action);
        if (isMissed instanceof Missed) {
          console.log(isMissed)
          await ui.renderMissed(this)
        }
        cardPlayedByEnermy.destroy();
      } else {
        console.log('???')
      }
    }
  }

  async refresh() {
    const enermy = await this.refreshEnermy(this, this.currentCombat());
    const player = await this.refreshPlayer(this, this.currentCombat());
    // todo: render draw pile
    const drawPile = await this.refreshDrawPile();
    const discardPile = this.refreshDiscardPile();
    const handCards = await this.refreshHandCards(this, this.currentCombat());
    // todo: render discard pile
    return { handCards, enermy, player, drawPile, discardPile }
  }

  refreshDrawPile() {
    const drawPile = this.currentCombat().player.getDrawPile();
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
    const pile = this.currentCombat().player.getDiscardPile();
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

  refreshHandCards(
    scene: Phaser.Scene,
    combat: Combat
  ): Promise<Phaser.GameObjects.Group> {
    // reset hand cards references
    for (let card of this.handCards) {
      card.destroy();
    }
    this.handCards = [];

    const hand = combat.player.getHand();
    for (let i = 0; i < hand.length; i++) {
      const cardContainer = this.renderCard(hand[i], 200 * 2 + this.cardWidth * i, 550 * 2, this.cardWidth, this.cardHeight);
      cardContainer.setInteractive();
      this.input.setDraggable(cardContainer);
      this.handCards.push(cardContainer);
    }
    const handCardGroup = new Phaser.GameObjects.Group(scene, this.handCards);
    if (this.currentCombat().getUnitOfThisTurn() === this.currentCombat().player) {
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
          await this.userAction.put(action);
        }
      }
      this.enermyCollider = this.physics.add.overlap(handCardGroup, this.enermyContainer, overlapListener);
      this.playerCollider = this.physics.add.overlap(handCardGroup, this.playerContainer, overlapListener);
    }
    return handCardGroup
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
    const text = this.add.text(50, -75, combat.enermy.name);
    text.setFontSize(70);

    // Display enermy health point
    const health = combat.enermy.getHealth();
    const healthLimit = combat.enermy.getHealthLimit();
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
    container.setData("model", combat.enermy);

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
    const health = combat.player.getHealth();
    const healthLimit = combat.player.getHealthLimit();
    const healthText = this.add.text(
      -player.width * player.scale / 4,
      -player.height * player.scale / 1.8,
      `${health}/${healthLimit}`
    );
    healthText.setFontSize(50);

    container.add(healthText);
    container.add(player);
    container.setData("model", combat.player);
    this.physics.add.existing(container);
    this.playerContainer = container;
    return container;
  }

  renderNextTurnButton() {
    const container = this.add.container(0, this.sys.game.canvas.height)
    const rect = this.add.rectangle(150, -200, 250, 100, 0x6666ff)
    const name = this.add.text(75, -220, `下一回合`)
    name.setFontSize(40)
    container.add(rect)
    container.add(name)

    rect.setInteractive()
    rect.on('pointerdown', async (pointer) => {
      console.log('clicked')
      this.enermyCollider.destroy();
      this.playerCollider.destroy();
      await this.nextTurn.put(undefined);
    });

    return container
  }

  currentCombat(): Combat {
    return this.combats[this.currentCombatIndex];
  }
}
