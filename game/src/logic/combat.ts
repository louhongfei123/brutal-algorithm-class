import * as csp from "../lib/csp";
import { Unit, CardEffect, Action } from "./interfaces";
import { log } from "./logger";
import * as errors from "./errors";
import * as card from "./card";
import { Deque } from './math';

type CombatState = "taking action";

export class Combat {
  unitOfThisTurn = this.participantA; // Participatn A defaults to the user.
  private stateChange = new csp.UnbufferredChannel<CombatState>();
  private multicaster = new csp.Multicaster<CombatState>(this.stateChange);
  private waitForWinnerChan = new csp.UnbufferredChannel<Unit>();

  constructor(public participantA: Unit, public participantB: Unit) { }

  onStateChange(): csp.Channel<CombatState> {
    return this.multicaster.copy();
  }

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
    if (this.participantA.getHealth() <= 0) {
      return this.participantB;
    } else if (this.participantB.getHealth() <= 0) {
      return this.participantA;
    } else {
      return undefined;
    }
  }

  getLooser(): Unit {
    if (this.hasWinner() === this.participantA) {
      return this.participantB;
    } else {
      return this.participantA;
    }
  }

  async takeTurn(unit: Unit) {
    // shuffling from discard pile if needed
    if (unit.getDrawPile().length === 0) {
      unit.shuffle()
    }

    // drawing
    unit.draw(2); // Let's only draw 2 cards as of now. Subject to change.

    // taking action
    await this.stateChange.put("taking action");
    while (true) {
      const action = await unit.takeAction({ opponent: this.getOpponent() });
      await log(
        `${action.from.name} used 【${action.card.name}】 against ${action.to.name}`
      );
      const err = unit.use(action.card, action.to);
      if (err instanceof errors.InvalidBehavior) {
        console.log(`无法使用【${action.card.name}】`);
        console.log(err.message)
        console.log('请重新出牌')
        continue;
      }
      break;
    }
  }

  async begin() {
    let winner: any = undefined;
    while (winner === undefined) {
      await log(`===================`);
      const unit = this.getUnitOfThisTurn();
      await log(`${unit.name}的回合`, "\n");
      await this.takeTurn(unit);
      this.changeTurn();
      winner = this.hasWinner();
      await log("-------------------\n\n\n");
    }
    log(`${winner.name} is the Winner!`);
    await this.waitForWinnerChan.put(winner);
    this.loot(winner, this.getLooser());
  }

  waitForWinner(): csp.Channel<Unit> {
    return this.waitForWinnerChan;
  }

  // Winner can loot 1 card from the looser
  async loot(winner: Unit, looser: Unit) { 
    throw new Error()
  }
}

