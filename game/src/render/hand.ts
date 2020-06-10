import { PIXI } from "../libs/pixi.js";
import { AIUnit, MainCharactor } from "../unit.ts";
import * as card from "../card.ts";
import { Card } from "../interfaces.ts";
import { Combat } from "../combat.ts";
import { log } from "../logger.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

export function renderHand(cards: Card[]) {
  // @ts-ignore
  const container = new PIXI.Container();
  container.sortableChildren = true;
  for (let [i, card] of cards.entries()) {
    let cardUI = CardUI(card.name, 400 + i * 128, 600);
    const originalY = cardUI.position.y;
    // @ts-ignore
    cardUI.on("mouseover", function (e) {
      // @ts-ignore
      cardUI.position.y += -40;
    });
    // @ts-ignore
    cardUI.on("mouseout", function (e) {
      // @ts-ignore
      cardUI.position.y = originalY;
    });
    container.addChild(cardUI);
  }
  return container;
}

function CardUI(cardName: string, x: number, y: number) {
  // @ts-ignore
  let aCard = new PIXI.Container();

  // @ts-ignore
  let rectangle = new PIXI.Graphics();
  rectangle.lineStyle(4, 0xFF3300, 1);
  rectangle.beginFill(0x66CCFF);
  rectangle.drawRect(x, y, 128, 192);
  rectangle.endFill();

  // @ts-ignore
  let cardNameTexture = new PIXI.Text(
    cardName,
    // @ts-ignore
    new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 30,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    }),
  );
  cardNameTexture.position.x = x;
  cardNameTexture.position.y = y;

  aCard.addChild(rectangle);
  aCard.addChild(cardNameTexture);

  const originalX = aCard.position.x;
  const originalY = aCard.position.y;

  var drag = false;
  createDragAndDropFor(aCard);

  // @ts-ignore
  function createDragAndDropFor(target) {
    target.interactive = true;
    // @ts-ignore
    target.on("mousedown", function (e) {
      drag = target;
      //   target.zIndex = 10;
      target.parent.setChildIndex(target, target.parent.children.length - 1);
    });
    // @ts-ignore
    target.on("mouseup", function (e) {
      // @ts-ignore
      drag.position.x = originalX;
      // @ts-ignore
      drag.position.y = originalY;
      drag = false;
    });
    // @ts-ignore
    target.on("mousemove", function (e) {
      if (drag) {
        // @ts-ignore
        drag.position.x += e.data.originalEvent.movementX;
        // @ts-ignore
        drag.position.y += e.data.originalEvent.movementY;
        // @ts-ignore
        // console.log(drag.position);
      }
    });
  }
  return aCard;
}
