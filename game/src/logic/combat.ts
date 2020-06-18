import * as csp from "../lib/csp";
import { select } from "../lib/csp";
import { AIUnit } from "../logic/unit";
import { Unit, CombatState } from "./interfaces";
import { log } from "./logger";



export class Combat {
  unitOfThisTurn = this.player; // Participatn A defaults to the user.
  private stateChange = new csp.UnbufferredChannel<void>();
  private multicaster = new csp.Multicaster<void>(this.stateChange);
  private waitForWinnerChan = new csp.UnbufferredChannel<Unit>();

  constructor(public player: Unit, public enermy: AIUnit) { }

  onStateChange(): csp.Channel<void | undefined> {
    return this.multicaster.copy();
  }

  getUnitOfThisTurn(): Unit {
    if (this.unitOfThisTurn === this.player) {
      return this.player;
    } else {
      return this.enermy;
    }
  }

  getOpponent(): Unit {
    if (this.unitOfThisTurn === this.player) {
      return this.enermy;
    } else {
      return this.player;
    }
  }

  changeTurn() {
    if (this.unitOfThisTurn === this.player) {
      this.unitOfThisTurn = this.enermy;
    } else {
      this.unitOfThisTurn = this.player;
    }
  }

  hasWinner(): Unit | undefined {
    if (this.player.getHealth() <= 0) {
      return this.enermy;
    } else if (this.enermy.getHealth() <= 0) {
      return this.player;
    } else {
      return undefined;
    }
  }

  getLooser(): Unit {
    if (this.hasWinner() === this.player) {
      return this.enermy;
    } else {
      return this.player;
    }
  }

  async takeTurn(unit: Unit) {
    // shuffling from discard pile if neededFgoToNextTurnChan
    if (unit.getDrawPile().length === 0) {
      unit.shuffle()
    }

    // drawing
    unit.draw(2); // Let's only draw 2 cards as of now. Subject to change.

    // taking action
    await this.stateChange.put();
    await unit.takeActions({ opponent: this.getOpponent(), stateChange: this.stateChange })
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

