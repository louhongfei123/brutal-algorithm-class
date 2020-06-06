
import { readLines } from "https://deno.land/std/io/bufio.ts";

const log = console.log;

class Robber {
    health = 30;
    attack = 10;
}

class MainCharacter {
    health = 40;
    attack = 10;
}

const robber = new Robber();
const mainC = new MainCharacter();

function choices(): string {
    return `A. 攻击
B. 防御`
}

function readInput(input: string) {
    if(input === 'A') {
        robber.health -= 10;
        log(`强盗剩余 ${robber.health} 生命值`);
    } else if (input === 'B') {

    } else {
        log('错误选项')
    }
}

function robberTurn() {
    mainC.health -= robber.attack;
    log(`强盗攻击了你，损失 ${robber.attack} 点生命`)
    log(`剩余${mainC.health} 点生命`)
}

function checkGameWinState() {
    return robber.health <= 0;
}

log('迎面一个强盗朝你走来，你要怎么做？')
log(choices())
for await (const line of readLines(Deno.stdin)) {
    readInput(line);
    robberTurn();
    if(checkGameWinState()) {
        log('You Win');
        break;
    }
}
