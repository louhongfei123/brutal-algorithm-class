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

  draw(unit: Unit, n: number) {
    const draw1 = new card.Draw1();
    for(let i = 0; i < n; i++) {
      const effect = draw1.effect({
        from: unit,
        to: unit
      })
      if(effect instanceof errors.InvalidBehavior) {
        console.warn(effect.message);
        break;
      }
      unit.cardEffects.push(effect.to);
    }
  }

  shuffle(unit: Unit) {
    const shuffle = new card.Shuffle();
    const effect = shuffle.effect({
      from: unit,
      to: unit
    })
    if(effect instanceof errors.InvalidBehavior) {
      throw effect;
    }
    unit.cardEffects.push(effect.to);
  }

  async takeTurn(unit: Unit) {
    // unit.assertEffectsValidity();
    // @ts-ignore
    console.log(unit.cards)
    console.log(unit.getDiscardPile())
    if (unit.getDrawPile().length === 0) {
      this.shuffle(unit);
    }
    console.log('drawing', unit.getHand());
    const failedToDraw = this.draw(unit, 2); // Let's only draw 2 cards as of now. Subject to change.
    await this.stateChange.put("taking action");
    console.log("failedToDraw", failedToDraw);
    console.log(unit.getHand());

    let action: Action;
    while (true) {
      action = await unit.takeAction({
        opponent: this.getOpponent(),
      });
      await log(
        `${action.from.name} used 【${action.card.name}】 against ${action.to.name}`
      );
      let effectOrError = action.card.effect(action);
      if (effectOrError instanceof errors.InvalidBehavior) {
        console.log(effectOrError.message);
        await log("please choose again\n");
        continue;
      }
      if(effectOrError.to) {
        action.to.cardEffects.push(effectOrError.to);
      }
      if(effectOrError.from) {
        action.from.cardEffects.push(effectOrError.from);
      }
      break;
    }
    // unit.moveToDiscardFromHand(action.card); // todo: something wrong here
    await log("-------------------\n\n\n");
  }

  async begin() {
    let winner: any = undefined;
    // let looser = undefined;
    while (winner === undefined) {
      const unit = this.getUnitOfThisTurn();
      await log(`===================`);
      await log(`${unit.name}'s turn`, "\n");
      await this.takeTurn(unit);
      //   const unitStatusDelta = action.card.effect(action.to);
      this.changeTurn();
      winner = this.hasWinner();
    }
    log(`${winner.name} is the Winner!`);
    await this.waitForWinnerChan.put(winner);
    this.loot(winner, this.getLooser());
  }

  waitForWinner(): csp.Channel<Unit> {
    return this.waitForWinnerChan;
  }

  // Winner can loot 1 card from the looser
  async loot(winner: Unit, looser: Unit) { }
}

