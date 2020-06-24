import Phaser from "phaser";
import {
  Card,
} from "../logic/interfaces";

import * as csp from "../lib/csp";
import * as ui from "../ui";
import { Deque } from "../logic/math";


export default class RewardScene extends Phaser.Scene {
  doneChan = csp.chan<Card>();

  constructor(
    public rewards: Deque<Card>,
  ) {
    super(RewardScene.name);
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("hand", "assets/hand.jpg");
  }
  create() {
    let img = this.add.image(ui.centerX(this), ui.centerY(this), "sky");
    img.setScale(2);

    let receivingArea = this.add.image(
      ui.centerX(this),
      ui.centerY(this) * 1.666,
      "hand",
    );
    receivingArea.setScale(0.666);
    receivingArea.setInteractive();
    this.physics.add.existing(receivingArea);

    let text = this.add.text(
      ui.centerX(this),
      ui.centerY(this) * 0.33,
      "请选择一张卡牌作为奖励",
    );
    text.setOrigin(0.5);
    text.setFontSize(70);
    console.log(text);

    console.log(this.rewards[0]);

    let card1 = ui.renderCard(
      this,
      this.rewards[0],
      ui.centerX(this) - 300,
      ui.centerY(this),
      200,
      400,
    );

    let card2 = ui.renderCard(
      this,
      this.rewards[1],
      ui.centerX(this),
      ui.centerY(this),
      200,
      400,
    );

    let card3 = ui.renderCard(
      this,
      this.rewards[2],
      ui.centerX(this) + 300,
      ui.centerY(this),
      200,
      400,
    );

    hover(card1);
    hover(card2);
    hover(card3);
    this.input.setDraggable(card1);
    this.input.setDraggable(card2);
    this.input.setDraggable(card3);
    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    const overlapListener = async (card, _) => {
      let pointer = this.input.activePointer;
      console.log(pointer);
      if (!pointer.isDown) {
        console.log("xxx");
        card1Collider.destroy();
        card2Collider.destroy();
        card3Collider.destroy();
        await this.doneChan.put(card.getData("model"));
      }
    };
    const card1Collider = this.physics.add.overlap(
      card1,
      receivingArea,
      overlapListener,
    );
    const card2Collider = this.physics.add.overlap(
      card2,
      receivingArea,
      overlapListener,
    );
    const card3Collider = this.physics.add.overlap(
      card3,
      receivingArea,
      overlapListener,
    );
  }

  async done(): Promise<Card> {
    let card = await this.doneChan.pop();
    this.scene.remove(RewardScene.name);
    // @ts-ignore
    return card;
  }
}

function hover(object: Phaser.GameObjects.Container) {
  object.setInteractive();
  object.on("pointerover", async () => {
    object.setScale(1 + 1 / 6);
  });

  object.on("pointerout", async () => {
    object.setScale(1);
  });
}
