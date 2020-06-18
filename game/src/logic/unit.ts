import * as csp from "../lib/csp";
import { log } from "./logger";
import { Unit, Card, CardInit, CombatState, Action, CardEffect } from "./interfaces";
import * as math from './math';
import { Deque } from './math';
import { InvalidBehavior } from './errors';
import { BaseUnit } from './unit_base';

export interface UserControlFunctions {
  getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
  actions: csp.Channel<Action>;
  nextTurn: csp.Channel<undefined>;
}

export class MainCharactor extends BaseUnit {
  readonly myTurn = csp.chan<void>();
  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  constructor(
    public name: string,
    cards: CardInit,
    // public choiceChan: csp.Channel<string>,
    // public userControlFunctions: UserControlFunctions,
    private userCommunications: UserCommunications
  ) {
    super(name, cards);
    console.log(this.cards)
  }

  async takeActions(combatState: CombatState): Promise<void> {
    let done = false;
    while(!done) {
      done = await csp.select([
        [this.userCommunications.actions, async(action) => {
          const err = this.use(action.card, action.to)
          await combatState.stateChange.put()
          return false;
        }],
        [this.userCommunications.nextTurn, async() => {
          return true;
        }]
      ]);
    }
  }

  // This function communicates with any outside system other than the Combat
  // that is interested to observe action taken by this unit.
  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTaken.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    return action;
  }

  async goToNextTurn() {
    await this.userCommunications.nextTurn.pop();
  }
  async goToNextTurnChan() {
    return this.userCommunications.nextTurn;
  }
}

export class AIUnit extends BaseUnit {
  readonly myTurn = csp.chan<void>();

  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  readonly actionTakenMulticaster: csp.Multicaster<Action> = new csp.Multicaster(this.actionTaken)
  readonly actionTakenObserverToUI = this.actionTakenMulticaster.copy()
  // readonly actionTakenObserverToCombat = this.actionTakenMulticaster.copy()
  readonly goToNexTurnChan_ = csp.chan<undefined>();

  constructor(public name: string, cards: CardInit) {
    super(name, cards);
  }

  async takeActions(combatState: CombatState): Promise<void> {
    while (true) {
      const action = {
        from: this,
        to: combatState.opponent,
        card: math.randomPick(this.getHand())
      };
      // check is action valid
      const err = this.use(action.card, action.to)
      if (err instanceof InvalidBehavior) {
        continue
      }
      await this.actionTaken.put(action);
      console.log('enermy');
      await combatState.stateChange.put()
      break
    }
  }

  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTakenObserverToUI.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    return action;
  }

  getDeck() {
    return this.cards.drawPile;
  }

  async goToNextTurnChan() {
    return this.goToNexTurnChan_;
  }
}
