import { AIUnit, MainCharactor, Combat, log, Attack } from "./game-def.ts";

const robber = new AIUnit("强盗", 30, [new Attack()]);
const mainC = new MainCharactor("主角", 30, [new Attack()]);
const combat = new Combat(mainC, robber);

log("迎面一个强盗朝你走来，你要怎么做？");
// log(choices())
combat.begin();
// for await (const line of readLines(Deno.stdin)) {
//     // readInput(line);
//     // robberTurn();
//     // if(checkGameWinState()) {
//     //     log('You Win');
//     //     break;
//     // }
// }
