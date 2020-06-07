import { readLines } from "https://deno.land/std/io/bufio.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

export const log = console.log;

export interface Action {
  from: Unit;
  to: Unit;
  card: Card;
}

class Unit {
  constructor(
    public name: string,
    public health: number,
    public cards: Card[],
  ) {}

  async getAction(combatState: CombatState): Promise<Action> {
    throw new Error("Not Implemented");
  }
}

interface CombatState {
  opponent: Unit;
}

export class MainCharactor extends Unit {
  async getAction(combatState: CombatState): Promise<Action> {
    // log(`getAction is called on ${this.name}`);
    log(`What is your action?`);
    for (const [i, card] of Object.entries(this.cards)) {
      log(`${i}. ${card.name}`);
    }
    const choice = await getChoiceFromUser();
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards[choice],
      // return new Action();
    };
  }
}

async function getChoiceFromUser(): Promise<number> {
  for await (const line of readLines(Deno.stdin)) {
    return Number(line);
  }
  return NaN;
}

export class AIUnit extends Unit {
  async getAction(combatState: CombatState): Promise<Action> {
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards[0],
    };
  }
}

// class Card {
//     constructor(
//         public
//     ){}
// }

export interface Card {
  // An effect method takes an an unit and produce a new state of the unit.
  name: string;
  effect(input: Unit): Unit;
}

export class Attack implements Card {
  name = Attack.name;
  constructor() {}
  effect(input: Unit): Unit {
    input.health -= 10;
    return input;
  }
}

export class Combat {
  unitOfThisTurn = this.participantA; // Participatn A defaults to the user.

  constructor(
    public participantA: Unit,
    public participantB: Unit,
  ) {}

  getUnitOfThisTurn(): Unit {
    if (this.unitOfThisTurn === this.participantA) {
      this.unitOfThisTurn = this.participantB;
      return this.participantA;
    } else {
      this.unitOfThisTurn = this.participantA;
      return this.participantB;
    }
  }

  getOpponent(): Unit {
    if (this.unitOfThisTurn === this.participantA) {
      return this.participantB;
    } else {
      return this.participantA;
    }
  }

  done() {
    return this.participantA.health <= 0 || this.participantB.health <= 0;
  }

  async begin() {
    while (!this.done()) {
      const unit = this.getUnitOfThisTurn();
      log(`===================`);
      log(`${unit.name}'s turn`);
      const action = await unit.getAction({
        opponent: this.getOpponent(),
      });
      log(`${unit.name} chose ${action}`);
      log(`-------------------`);
      log();
      await csp.sleep(700);
    }
    // todo: apply this action
  }
}
