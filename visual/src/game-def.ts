import { readLines } from "https://deno.land/std/io/bufio.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

export const log = async function (...args: string[]) {
  await csp.sleep(333);
  console.log(...args);
};

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
    const choice = await (async () => {
      while (true) {
        await log(`Please choose 1 card from below`);
        for (const [i, card] of Object.entries(this.cards)) {
          log(`${i}. ${card.name}`);
        }
        const choice = await getChoiceFromUser();
        if (!(choice in this.cards)) {
          await log(`${choice} is an invalid choice, please choose again`);
          await log();
        } else {
          return choice;
        }
      }
    })();

    await csp.sleep(500);
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
      return this.participantA;
    } else {
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

  changeTurn() {
    if (this.unitOfThisTurn === this.participantA) {
      this.unitOfThisTurn = this.participantB;
    } else {
      this.unitOfThisTurn = this.participantA;
    }
  }

  hasWinner(): Unit | undefined {
    if (this.participantA.health <= 0) {
      return this.participantB;
    } else if (this.participantB.health <= 0) {
      return this.participantA;
    } else {
      return undefined;
    }
  }

  async begin() {
    let winner = undefined;
    while (winner === undefined) {
      const unit = this.getUnitOfThisTurn();
      await log(`===================`);
      await log(`${unit.name}'s turn`);
      const action = await unit.getAction({
        opponent: this.getOpponent(),
      });
      await log();

      await log(
        `${unit.name} used 【${action.card.name}】 against ${action.to.name}`,
      );
      action.card.effect(action.to);
      await log(
        `${this.getOpponent().name} has ${this.getOpponent().health} health left`,
      );
      await log(`-------------------`);
      await log();
      await csp.sleep(700);
      this.changeTurn();
      winner = this.hasWinner();
    }
    // todo: apply this action
    log(`${winner.name} is the Winner!`);
  }
}
