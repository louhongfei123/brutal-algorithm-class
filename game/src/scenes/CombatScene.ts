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
import * as playerHelper from "./player";
import * as enermyHelper from "./enermy";


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
  // @ts-ignore
  nextTurnButton: {
    conatiner: Phaser.GameObjects.Container;
    rect: Phaser.GameObjects.Rectangle
  }
  // @ts-ignore
  handCardGroup: Phaser.GameObjects.Group

  userAction = new csp.UnbufferredChannel<Action>();
  nextTurn = new csp.UnbufferredChannel<undefined>();
  readonly cardWidth = 90 * 2;
  readonly cardHeight = 148 * 2;

  constructor() {
    super("game-scene");

    const drawPile = new Deque<Card>(
      new card.Attack(10),
      new card.FollowUpAttack(),
      new card.Attack(10),
      new card.QiFlow(),
    );
    console.log(drawPile);
    drawPile.last();
    const mainC = new MainCharactor(
      "Player",
      {
        drawPile: drawPile,
        equipped: new Deque<EquippmentCard>(
          new card.Health(10),
          new card.Agility(30)
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
      new Combat(mainC, units.ExternalDisciple())
    ]
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("girl_1", "assets/girl_1.png");
    this.load.image("girl_2", "assets/girl_2.png");
  }

  async create() {
    let img = this.add.image(400 * 2, 300 * 2, "sky");
    img.setScale(2)
    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.nextTurnButton = playerHelper.renderNextTurnButton(this);
    this.gameControlLoop();
  }

  async gameControlLoop() {
    let waitForCombat = this.currentCombat().begin();
    let onStateChangeChan = this.currentCombat().onStateChange(); 
    console.log(onStateChangeChan);
    while (true) {
      console.log('waiting for state change', onStateChangeChan);
      let change = await onStateChangeChan.pop();
      console.log('state has been changed');
      if(onStateChangeChan.closed()) {
        throw new Error('unreachable')
      }
      const combat = this.currentCombat();
      const u = combat.getUnitOfThisTurn();
      console.log('refreshing');
      const { handCardGroup, enermy, player } = await this.refresh();
      console.log('refreshed');
      if (combat.hasWinner()) {
        console.log('hasWinner')
        const text =
          this.currentCombat().hasWinner() === this.currentCombat().player ?
            await ui.renderVictory(this, 3000) :
            await ui.renderLost(this, 3000)
        
        console.log('wait for current combat to finish');
        await waitForCombat;
        console.log('current combat is finished');
        this.currentCombatIndex++;
        console.log('next combat');
        waitForCombat = this.currentCombat().begin();
        onStateChangeChan = this.currentCombat().onStateChange();
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
        const isMissed = combat.enermy.commit(action);
        const waitDuration = 1500;
        if (isMissed instanceof Missed) {
          console.log(isMissed)
          await ui.renderMissed(this, waitDuration)
        } else {
          await csp.sleep(waitDuration);
        }

        cardPlayedByEnermy.destroy();
      }
      else if (u === combat.player) {
        console.log('player');
        playerHelper.setNextTurnButtonInteractive(this);
        playerHelper.setHandCardsInteractive(this);
      }
      else {
        console.log('should not');
      }
      console.log('end of loop');
    }
    throw new Error('12321321');
  }

  async refresh() {
    const enermy = await enermyHelper.refreshEnermy(this, this.currentCombat());
    const player = await playerHelper.refreshPlayer(this, this.currentCombat());
    // todo: render draw pile
    const drawPile = await playerHelper.refreshDrawPile(this);
    const discardPile = playerHelper.refreshDiscardPile(this);
    this.handCardGroup = await playerHelper.refreshHandCards(this, this.currentCombat());
    // todo: render discard pile
    return { handCardGroup: this.handCardGroup, enermy, player, drawPile, discardPile }
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

  currentCombat(): Combat {
    return this.combats[this.currentCombatIndex];
  }
}
