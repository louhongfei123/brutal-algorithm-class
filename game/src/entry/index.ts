import { PIXI } from "../libs/pixi.js";
import { AIUnit, MainCharactor } from "../unit.ts";
import * as card from "../card.ts";
import { Card } from "../interfaces.ts";
import { Combat } from "../game-def.ts";
import { log } from "../logger.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

let type = "WebGL";
// @ts-ignore
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

// @ts-ignore
PIXI.utils.sayHello(type);

//Create a Pixi Application
// @ts-ignore
//Create a Pixi Application
let app = new PIXI.Application({
  width: 1280,
  height: 720,
  antialias: true,
  transparent: false,
  resolution: 1,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

async function main() {
  //   CardUI("攻击1");
  //   CardUI("攻击2");

  const robber1 = new AIUnit("强盗1", {
    drawPile: [
      new card.Attack2(),
      new card.Attack2(),
    ],
    equipped: [
      new card.Health(1),
    ],
  });
  const robber2 = new AIUnit("强盗2", {
    drawPile: [
      new card.Attack3(),
      new card.Attack3(),
      new card.FollowUpAttack(),
    ],
    equipped: [
      new card.Health(5),
    ],
  });

  const mainC = new MainCharactor("主角", {
    drawPile: [
      new card.Attack1(),
      new card.Attack1(),
      new card.Heal(),
    ],
    equipped: [
      new card.Health(5),
    ],
  }, new csp.UnbufferredChannel<string>());
  // Start the campagin
  log("迎面一个强盗朝你走来，你要怎么做？");
  const combat1 = new Combat(mainC, robber1);
  renderCom(combat1.onStateChange());
  await combat1.begin();
  const combat2 = new Combat(mainC, robber2);
  await combat2.begin();
}

async function renderCom(combatStateChange: csp.Channel<Combat>) {
  while (true) {
    // console.log("wait");
    let combat = await combatStateChange.pop();
    // console.log("done");
    if (!combat) {
      throw new Error("unreachable");
    }

    // Render player's hand cards
    renderHand(combat.participantA.cards.hand);

    // Render discard pile
    let discardPile = combat.participantA.cards.discardPile;
    for (let card of discardPile) {
      CardUI(card.name, 550, 430);
    }

    // Render draw pile

    // Render player
    CardUI("You", 200, 300);

    // Render enermy
    CardUI("enermy", 800, 300);
  }
}

function renderHand(cards: Card[]) {
  for (let [i, card] of cards.entries()) {
    let cardUI = CardUI(card.name, 400 + i * 128, 600);
    // @ts-ignore
    cardUI.on("mouseover", function (e) {
      // @ts-ignore
      cardUI.position.y += -40;
    });
    // @ts-ignore
    cardUI.on("mouseout", function (e) {
      // @ts-ignore
      cardUI.position.y += 40;
    });
  }
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

  app.stage.addChild(aCard);

  var drag = false;
  createDragAndDropFor(aCard);

  // @ts-ignore
  function createDragAndDropFor(target) {
    target.interactive = true;
    // @ts-ignore
    target.on("mousedown", function (e) {
      drag = target;
    });
    // @ts-ignore
    target.on("mouseup", function (e) {
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
        console.log(drag.position);
      }
    });
  }
  return aCard;
}

main();
