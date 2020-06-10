import { AIUnit, MainCharactor } from "../unit.ts";
import * as card from "../card.ts";
import { Combat } from "../game-def.ts";
import { log } from "../logger.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

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
await combat1.begin();
const combat2 = new Combat(mainC, robber2);
await combat2.begin();
