import { AIUnit, MainCharactor } from "./unit.ts";
import * as card from "./card.ts";
import { Combat } from "./game-def.ts";
import { log } from "./logger.ts";

const robber = new AIUnit("强盗", 30, [new card.Attack(), new card.Heal()]);
const mainC = new MainCharactor("主角", 30, [new card.Attack(), new card.Heal()]);
const combat = new Combat(mainC, robber);

log("迎面一个强盗朝你走来，你要怎么做？");
combat.begin();
