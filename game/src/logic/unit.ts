import * as csp from "../lib/csp";
import { log } from "./logger";
import { Unit, CardInit, CombatState, Action } from "./interfaces";
import { Actions } from "phaser";

export interface UserControlFunctions {
  getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
  actions: csp.Channel<Action>;
}

export class MainCharactor extends Unit {
  constructor(
    public name: string,
    cards: CardInit,
    // public choiceChan: csp.Channel<string>,
    // public userControlFunctions: UserControlFunctions,
    private userCommunications: UserCommunications
  ) {
    super(name, cards);
  }

  async takeAction(combatState: CombatState): Promise<Action> {
    // const choice = await (async () => {
    //   while (true) {
    //     await log(`Please choose 1 card from below`);
    //     for (const [i, card] of Object.entries(this.cards.hand)) {
    //       await log(`${Number(i) + 1}. ${card.name}`);
    //     }
    //     const choice = await getChoiceFromUser(this.choiceChan);
    //     if (!(Number(choice) - 1 in this.cards.hand)) {
    //       await log(
    //         `${choice} is an invalid choice, please choose again`,
    //         "\n",
    //       );
    //     } else {
    //       return choice;
    //     }
    //   }
    // })();
    console.log("main charactor needs to take action");
    // const choice = await this.userControlFunctions.getChoiceFromUser();
    // console.debug("userControlFunctions.getChoiceFromUser", choice);

    // const targetUnit = await (async () => {
    //   while (true) {
    //     await log(`Please choose the target`);
    //     await log(`1. ${this.name}`);
    //     await log(`2. ${combatState.opponent.name}`);
    //     const choice = await getChoiceFromUser(this.choiceChan);
    //     if (choice === "1") {
    //       return this;
    //     } else if (choice === "2") {
    //       return combatState.opponent;
    //     } else {
    //       await log(`${choice} is an invalid choice, please choose again`);
    //     }
    //   }
    // })();

    const action = await this.userCommunications.actions.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    console.log("game logic received", action);
    return action;

    // await csp.sleep(400);
    // return {
    //   from: this,
    //   to: targetUnit,
    //   card: this.cards.hand[Number(choice) - 1],
    // };
  }
}

async function getChoiceFromUser(choice: csp.Channel<string>): Promise<string> {
  console.log("debug mark"); // todo: implement it
  let chosen = await choice.pop();
  console.log("debug mark 2");
  if (!chosen) {
    throw new Error("unreachable");
  }
  return chosen;
}

export class AIUnit extends Unit {
  async takeAction(combatState: CombatState): Promise<Action> {
    log("AI is taking actions");
    await csp.sleep(10000);
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards.hand[0],
    };
  }
}
