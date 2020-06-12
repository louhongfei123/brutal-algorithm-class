import * as csp from "../lib/csp";
import { log } from "./logger";
import { Unit, CardInit, CombatState, Action } from "./interfaces";

export interface UserControlFunctions {
  getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
  actions: csp.Channel<Action>;
}

export class MainCharactor extends Unit {
  myTurn: csp.Channel<undefined> = new csp.UnbufferredChannel();
  constructor(
    public name: string,
    cards: CardInit,
    // public choiceChan: csp.Channel<string>,
    // public userControlFunctions: UserControlFunctions,
    private userCommunications: UserCommunications,
  ) {
    super(name, cards);
  }

  async takeAction(combatState: CombatState): Promise<Action> {
    console.log("main charactor needs to take action");
    await this.myTurn.put(undefined);
    const action = await this.userCommunications.actions.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    console.log("game logic received", action);
    return action;
  }

  async waitForTurn() {
    return this.myTurn.pop();
  }
}

// async function getChoiceFromUser(choice: csp.Channel<string>): Promise<string> {
//   console.log("debug mark"); // todo: implement it
//   let chosen = await choice.pop();
//   console.log("debug mark 2");
//   if (!chosen) {
//     throw new Error("unreachable");
//   }
//   return chosen;
// }

export class AIUnit extends Unit {
  async takeAction(combatState: CombatState): Promise<Action> {
    log("AI is taking actions");
    await csp.sleep(3000);
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards.hand[0],
    };
  }

  // There is no need to wait for AI.
  async waitForTurn(): Promise<undefined> {
    return;
  }
}
