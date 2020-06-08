import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import { log } from "./logger.ts";
import { Unit, CombatState, Action } from "./interfaces.ts";
import { readLines } from "https://deno.land/std/io/bufio.ts";

export class MainCharactor extends Unit {
  async getAction(combatState: CombatState): Promise<Action> {
    const choice = await (async () => {
      while (true) {
        await log(`Please choose 1 card from below`);
        for (const [i, card] of Object.entries(this.cards.hand)) {
          log(`${Number(i) + 1}. ${card.name}`);
        }
        const choice = await getChoiceFromUser();
        if (!(Number(choice) - 1 in this.cards.hand)) {
          await log(
            `${choice} is an invalid choice, please choose again`,
            "\n",
          );
        } else {
          return choice;
        }
      }
    })();

    const targetUnit = await (async () => {
      while (true) {
        await log(`Please choose the target`);
        await log(`1. ${this.name}`);
        await log(`2. ${combatState.opponent.name}`);
        const choice = await getChoiceFromUser();
        if (choice === "1") {
          return this;
        } else if (choice === "2") {
          return combatState.opponent;
        } else {
          await log(`${choice} is an invalid choice, please choose again`);
        }
      }
    })();

    await csp.sleep(400);
    return {
      from: this,
      to: targetUnit,
      card: this.cards.hand[Number(choice) - 1],
    };
  }
}

async function getChoiceFromUser(): Promise<string> {
  for await (const line of readLines(Deno.stdin)) {
    if (line === "") {
      continue;
    }
    return line;
  }
  throw new Error("unreachable");
}

export class AIUnit extends Unit {
  async getAction(combatState: CombatState): Promise<Action> {
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards.hand[0],
    };
  }
}
