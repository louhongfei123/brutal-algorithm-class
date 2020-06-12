import * as csp from "../lib/csp";
import { Unit } from "./interfaces";
import { log } from "./logger";

type CombatState = "taking action";

export class Combat {
  unitOfThisTurn = this.participantA; // Participatn A defaults to the user.
  private stateChange = new csp.UnbufferredChannel<CombatState>();
  private multicaster = new csp.Multicaster<CombatState>(this.stateChange);

  constructor(public participantA: Unit, public participantB: Unit) {}

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
    const { effect, action } = await (async () => {
      while (true) {
        if (unit.cards.drawPile.length === 0) {
          unit.shuffle();
        }
        // console.log(JSON.stringify(unit, null, 1));
        console.log(unit.cards.hand);
        const failedToDraw = await unit.draw(2); // Let's only draw 2 cards as of now. Subject to change.
        await this.stateChange.put("taking action");
        console.log("failedToDraw", failedToDraw);
        console.log(unit.cards.hand);
        const action = await unit.takeAction({
          opponent: this.getOpponent(),
        });
        await log(
          `${action.from.name} used 【${action.card.name}】 against ${action.to.name}`
        );

        try {
          return { effect: action.card.effect(action), action };
        } catch (e) {
          // This is not a valid action.
          await log(e.message);
          await log("please choose again\n");
          continue;
        }
        // This is a valid action, the card has been exercised.
        // Move the card from hand to discard pile.
        unit.moveToDiscardFromHand(action.card); // todo: something wrong here
      }
    })();

    await log(
      `${action.card.name}: ${JSON.stringify(action.card.effect(action))}`
    );
    action.to.cardEffects.push(effect);
    action.from.cards.discardPile.push(action.card);
    await log(
      `${
        action.to.name
      } has ${action.to.getHealth()}/${action.to.getHealthLimit()} health left`
    );
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
      await csp.sleep(233);
    }
    log(`${winner.name} is the Winner!`);

    this.loot(winner, this.getLooser());
  }

  // Winner can loot 1 card from the looser
  async loot(winner: Unit, looser: Unit) {}
}
