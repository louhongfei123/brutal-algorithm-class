export enum CardCategory {
  NormalCard = "NormalCard",
  EquippmentCard = "EquippmentCard",
}

export interface Card {
  // kind is useful for both TSC checking and for JSON serialization.
  kind: CardCategory;
  name: string;
  effect(input: Unit): CardEffect;
}

// A difference vector that represents the current state of the unit.
export interface CardEffect {
  by: Card;
  health?: number;
  healthLimit?: number;
}

export interface NormalCard extends Card {
  // An effect method takes an an unit and produce a new state of the unit.
  kind: CardCategory.NormalCard;
}

export abstract class EquippmentCard implements Card {
  kind = CardCategory.EquippmentCard;
  name = "";
  abstract effect(input: Unit): CardEffect;
}

export interface Action {
  from: Unit;
  to: Unit;
  card: Card;
}

export interface CombatState {
  opponent: Unit;
}

export interface CardInit {
  // 手牌
  hand: Card[];
  // 牌堆
  deck: Card[];
  // 已装备的牌
  equipped: EquippmentCard[];
}

export class Unit {
  protected health = 0;
  protected healthLimit = 0;
  public cardEffects: CardEffect[] = [];
  constructor(
    public name: string,
    public cards: CardInit,
  ) {
    for (let card of cards.equipped) {
      const effect = card.effect(this);
      this.cardEffects.push(effect);
    }
  }
  async getAction(combatState: CombatState): Promise<Action> {
    throw new Error("Not Implemented");
  }
  getHealth(): number {
    const health = this.cardEffects.map(
      (element) => element.health || 0,
    ).reduce(
      (p, c) => p + c,
      0,
    );
    return health;
  }

  getHealthLimit(): number {
    return this.cardEffects.map(
      (element) => element.healthLimit || 0,
    ).reduce(
      (p, c) => p + c,
    );
  }
  isDead(): boolean {
    return this.getHealth() <= 0;
  }
}
