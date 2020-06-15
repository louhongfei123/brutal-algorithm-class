import * as csp from "../lib/csp";
import { log } from "./logger";
import { Unit, CardInit, CombatState, Action } from "./interfaces";
import * as math from './math';

export interface UserControlFunctions {
  getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
  actions: csp.Channel<Action>;
}

export class MainCharactor extends Unit {
  readonly myTurn: csp.Channel<undefined> = new csp.UnbufferredChannel();
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

  // This function communicates with the Combat and user.
  async takeAction(combatState: CombatState): Promise<Action> {
    console.log("main charactor needs to take action");
    await this.myTurn.put(undefined);
    const action = await this.userCommunications.actions.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    console.log("game logic received", action);
    // this.actionTaken.put(action);
    return action;
  }

  waitForTurn() {
    return this.myTurn;
  }

  // This function communicates with any outside system other than the Combat
  // that is interested to observe action taken by this unit.
  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTaken.pop();
    if(!action) {
      throw new Error("unreachable");
    }
    return action;
  }
}

export class AIUnit extends Unit {
  readonly chan = csp.chan<undefined>();
  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  constructor(public name: string, cards: CardInit) {
    super(name, cards);
  }
  async takeAction(combatState: CombatState): Promise<Action> {
    await log("AI is taking actions");
    await this.chan.put(undefined);
    const action = {
      from: this,
      to: combatState.opponent,
      card: math.randomPick(this.cards.hand)
    };
    await this.actionTaken.put(action);
    return action;
  }

  // There is no need to wait for AI.
  waitForTurn() {
    return this.chan;
  }

  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTaken.pop();
    if(!action) {
      throw new Error("unreachable");
    }
    return action;
  }
}
