
// import { readLines } from "https://deno.land/std/io/bufio.ts";

export const log = console.log;

export class Action {}

export class Unit {
    constructor(
        public name: string,
        public health: number,
        public cards: Card[]
    ) {}

    getAction(): Action {
        throw new Error('Not Implemented');
        // log(`getAction is called on ${this.name}`);
        // return new Action();
    }
}

export class MainCharactor extends Unit {

    getAction(): Action {
        log(`getAction is called on ${this.name}`);
        return new Action();
    }

}

// class Card {
//     constructor(
//         public 
//     ){}
// }

export interface Card {
    // An effect method takes an an unit and produce a new state of the unit.
    name: string
    effect(input: Unit): Unit
}

export class Attack implements Card {
    name = Attack.name;
    constructor(public owner: Unit) {}
    effect(input: Unit): Unit {
        log(`${this.owner} played ${this.name} against ${input}`);
        input.health -= 10;
        return input;
    }
}

// function choices(): string {
//     return `A. 攻击
// B. 防御`
// }

// function readInput(input: string) {
//     if(input === 'A') {
//         robber.health -= 10;
//         log(`强盗剩余 ${robber.health} 生命值`);
//     } else if (input === 'B') {

//     } else {
//         log('错误选项')
//     }
// }

// function robberTurn() {
//     mainC.health -= robber.attack;
//     log(`强盗攻击了你，损失 ${robber.attack} 点生命`)
//     log(`剩余${mainC.health} 点生命`)
// }

// function checkGameWinState() {
//     return robber.health <= 0;
// }

export class Combat {
    
    unitOfThisTurn = this.participantA; // Participatn A defaults to the user.
    
    constructor(
        public participantA: Unit,
        public participantB: Unit
    ) {}

    getUnitOfThisTurn(): Unit {
        if(this.unitOfThisTurn === this.participantA) {
            this.unitOfThisTurn = this.participantB;
            return this.participantA;
        } else {
            this.unitOfThisTurn = this.participantA;
            return this.participantB;
        }
    }

    begin() {
        const unit = this.getUnitOfThisTurn();
        const action = unit.getAction();
        // todo: apply this action
    }
}
