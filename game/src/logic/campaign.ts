import { Combat } from "./combat";

// A compaign is a sequence of combats.
export class Campaign {
  currentCombatIndex = 0;

  constructor(
    public combats: Combat[],
  ) {
    if (combats.length === 0) {
      throw new Error("A campaign must has at least 1 combat");
    }
    this.combats = combats;
  }

  currentCombat(): Combat {
    return this.combats[this.currentCombatIndex];
  }
}
