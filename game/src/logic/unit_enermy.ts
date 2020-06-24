import * as csp from "../lib/csp";
import {
  Card,
  CardInit,
  CombatState,
  Action,
  Missed,
} from "./interfaces";
import * as math from "./math";
import { InvalidBehavior } from "./errors";
import { BaseUnit } from "./unit_base";


export class AIUnit extends BaseUnit {
  readonly myTurn = csp.chan<void>();

  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  readonly actionTakenMulticaster: csp.Multicaster<Action> = new csp
    .Multicaster(this.actionTaken);
  readonly actionTakenObserverToUI = this.actionTakenMulticaster.copy();
  // readonly actionTakenObserverToCombat = this.actionTakenMulticaster.copy()
  readonly goToNexTurnChan_ = csp.chan<undefined>();

  constructor(public name: string, cards: CardInit) {
    super(name, cards);
  }

  async takeActions(combatState: CombatState): Promise<void> {
    // find one valid action
    let action: Action | undefined;
    while (action === undefined) {
      const card: Card = math.randomPick(this.getHand());
      // check if this action is valid
      const err = card.effect({ from: this, to: combatState.opponent });
      if (err instanceof InvalidBehavior) {
        console.log(err);
        continue;
      }
      action = {
        from: this,
        to: combatState.opponent,
        card: card,
      };
    }
    await this.actionTaken.put(action);
  }

  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTakenObserverToUI.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    return action;
  }

  commit(action: Action): Missed | void {
    const err = this.use(action.card, action.to);
    if (err instanceof InvalidBehavior) {
      throw err;
    }
    return err;
  }

  getDeck() {
    return this.cards.deck;
  }

}
