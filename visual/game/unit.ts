import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import { log } from "./logger.ts";
import { Unit, CombatState, Action } from "./interfaces.ts";
import { readLines } from "https://deno.land/std/io/bufio.ts";
export class MainCharactor extends Unit {
  async getAction(combatState: CombatState): Promise<Action> {
    const choice = await (async () => {
      while (true) {
        await log(`Please choose 1 card from below`);
        for (const [i, card] of Object.entries(this.cards)) {
          log(`${i}. ${card.name}`);
        }
        const choice = await getChoiceFromUser();
        if (!(choice in this.cards)) {
          await log(`${choice} is an invalid choice, please choose again`);
          await log();
        } else {
          return choice;
        }
      }
    })();

    await csp.sleep(500);
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards[choice],
      // return new Action();
    };
  }
}

async function getChoiceFromUser(): Promise<number> {
  for await (const line of readLines(Deno.stdin)) {
    return Number(line);
  }
  return NaN;
}

export class AIUnit extends Unit {
  async getAction(combatState: CombatState): Promise<Action> {
    return {
      from: this,
      to: combatState.opponent,
      card: this.cards[0],
    };
  }
}
