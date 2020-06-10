import { PIXI } from "../libs/pixi.js";
import { AIUnit, MainCharactor } from "../unit.ts";
import * as card from "../card.ts";
import { Card, Unit } from "../interfaces.ts";
import { Combat } from "../combat.ts";
import { log } from "../logger.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

export function renderUnit(unit: Unit, x: number, y: number) {
  // @ts-ignore
  let unitContainer = new PIXI.Container();

  // @ts-ignore
  let rectangle = new PIXI.Graphics();
  rectangle.lineStyle(4, 0xFF3300, 1);
  rectangle.beginFill(0x66CCFF);
  rectangle.drawRect(x, y, 128, 192);
  rectangle.endFill();

  // @ts-ignore
  let cardNameTexture = new PIXI.Text(
    unit.name,
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

  unitContainer.addChild(rectangle);
  unitContainer.addChild(cardNameTexture);

  const originalX = unitContainer.position.x;
  const originalY = unitContainer.position.y;
  return unitContainer;
}
