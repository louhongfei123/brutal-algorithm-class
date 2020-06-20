import * as csp from "../lib/csp";
import { AIUnit, MainCharactor } from "../logic/unit";
import { Unit, Card } from "./interfaces";
import { log } from "./logger";
import { Deque } from "./math";


export class Combat {
  unitOfThisTurn = this.player; // Participatn A defaults to the user.
  private stateChange = new csp.UnbufferredChannel<void>();
  // private multicaster = new csp.Multicaster<void>(this.stateChange);
  private waitForWinnerChan = new csp.UnbufferredChannel<Unit>();

  constructor(
    public player: MainCharactor, 
    public enermy: AIUnit,
    public reward: Deque<Card>
  ) {
    // @ts-ignore
    this.stateChange.id = Math.floor(Math.random() * 100)
    console.log(this.stateChange);
    console.log(this.stateChange.popActions.length)
  }

  onStateChange(): csp.Channel<void> {
    return this.stateChange
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
    console.log(unit.getHand());
    // taking action
    await this.stateChange.put();
    await unit.takeActions({ opponent: this.getOpponent(), stateChange: this.stateChange })
  }

  async begin() {
    let winner: any = undefined;
    while (winner === undefined) {
      await log(`===================`);
      const unit = this.getUnitOfThisTurn();
      await log(`${unit.name}'s turn`, "\n");
      await this.takeTurn(unit);
      console.log(`${unit.name} has finished its turn`)
      this.changeTurn();
      winner = this.hasWinner();
      await log("-------------------\n\n\n");
    }
    log(`${winner.name} is the Winner!`);
    // await this.waitForWinnerChan.put(winner);
    await this.end();
    await this.loot(winner, this.getLooser());
  }

  async end() {
    await this.stateChange.close()
    await this.waitForWinnerChan.close();
  }

  waitForWinner(): csp.Channel<Unit> {
    return this.waitForWinnerChan;
  }

  // Winner can loot 1 card from the looser
  async loot(winner: Unit, looser: Unit) {
    console.log('loot is not done yet');
    // throw new Error()
  }
}

