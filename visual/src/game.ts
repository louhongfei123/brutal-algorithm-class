import { Unit, MainCharactor, Combat, log} from './game-def.ts';

const robber = new Unit('强盗', 30, []);
const mainC = new MainCharactor('主角', 30, []);
const combat = new Combat(mainC, robber);

log('迎面一个强盗朝你走来，你要怎么做？');
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
