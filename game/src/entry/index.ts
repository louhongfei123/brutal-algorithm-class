import { PIXI } from "../libs/pixi.js";
import { AIUnit, MainCharactor } from "../unit.ts";
import * as card from "../card.ts";
import { Card } from "../interfaces.ts";
import { Combat } from "../combat.ts";
import { log } from "../logger.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import { renderHand } from "../render/hand.ts";
import { renderUnit } from "../render/unit.ts";
import { hitTestRectangle } from "../render/collision.ts"

let type = "WebGL";
// @ts-ignore
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

// @ts-ignore
PIXI.utils.sayHello(type);

const Width = 1280;
const Height = 720;

//Create a Pixi Application
// @ts-ignore
//Create a Pixi Application
let app = new PIXI.Application({
  width: Width,
  height: Height,
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

  const userCardSelection = new csp.UnbufferredChannel<any>();
  const userControlFunctions = {
    getChoiceFromUser: async function () {
      return userCardSelection.pop();
    },
  };

  const mainC = new MainCharactor(
    "主角",
    {
      drawPile: [
        new card.Attack1(),
        new card.Attack1(),
        new card.Heal(),
      ],
      equipped: [
        new card.Health(5),
      ],
    },
    new csp.UnbufferredChannel<string>(),
    userControlFunctions,
  );
  // Start the campagin
  log("迎面一个强盗朝你走来，你要怎么做？");
  const combat1 = new Combat(mainC, robber1);
  const combatRenderrer = renderCombat(
    combat1.onStateChange(),
    userCardSelection,
  );
  const combatState = combat1.begin();

  await combatState;
  console.debug("Combat is done!");
  await combatRenderrer;
  console.debug("combat renderer exits");
  //   const combat2 = new Combat(mainC, robber2);
  //   await combat2.begin();
}

async function renderCombat(
  combatStateChange: csp.Channel<Combat>,
  userCardSelection: csp.Channel<any>,
) {
  while (true) {
    // console.log("wait");
    let combat = await combatStateChange.pop();
    // console.log("done");
    if (!combat) {
      throw new Error("unreachable");
    }

    // Render turn
    const unitOfThisTurn = combat.getUnitOfThisTurn();
    // @ts-ignore
    let whosTurn = new PIXI.Text(
      `${unitOfThisTurn.name}'s Turn`,
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
    whosTurn.position.x = positionX(0.5, 100);
    whosTurn.position.y = positionY(0.25, 100);
    app.stage.addChild(whosTurn);

    // Render discard pile
    // let discardPile = combat.participantA.cards.discardPile;
    // for (let card of discardPile) {
    //   CardUI(card.name, 550, 430);
    // }

    // Render draw pile

    // Render player
    // CardUI("You", 200, 300);
    const you = renderUnit(combat.participantA, 200, 300);
    app.stage.addChild(you);

    // Render enermy
    const enermy = renderUnit(combat.participantB, 800, 300);
    app.stage.addChild(enermy);

    // Render player's hand cards
    app.stage.addChild(renderHand(combat.participantA.cards.hand));
  }
}

function positionX(x: number, width: number): number {
  return Width * x - width / 2;
}

function positionY(y: number, height: number): number {
  return Height * y - height / 2;
}

main();
