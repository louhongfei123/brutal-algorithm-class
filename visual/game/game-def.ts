import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import { Unit } from "./interfaces.ts";
import { log } from "./logger.ts";

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
    if (this.participantA.getHealth() <= 0) {
      return this.participantB;
    } else if (this.participantB.getHealth() <= 0) {
      return this.participantA;
    } else {
      return undefined;
    }
  }

  async takeTurn(unit: Unit) {
    const [effect, action] = await (async () => {
      while (true) {
        const action = await unit.getAction({
          opponent: this.getOpponent(),
        });
        await log(
          `${action.from.name} used 【${action.card.name}】 against ${action.to.name}`,
        );

        try {
          return [action.card.effect(action), action];
        } catch (e) {
          await log(e);
          continue;
        }
      }
    })();

    await log(
      `${action.card.name}: ${JSON.stringify(action.card.effect(action))}`,
    );
    action.to.cardEffects.push(effect);
    action.from.cards.discardPile.push(action.card);
    await log(
      `${action.to.name} has ${action.to.getHealth()}/${action.to.getHealthLimit()} health left`,
    );
    await log("-------------------\n\n\n");
  }

  async begin() {
    let winner = undefined;
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
    // todo: apply this action
    log(`${winner.name} is the Winner!`);
  }
}
