export enum CardCategory {
  NormalCard,
  EquippmentCard,
}

export interface Card {
  // kind is useful for both TSC checking and for JSON serialization.
  kind: CardCategory;
  name: string;
  effect(input: Unit): UnitStateDelta;
}

export interface NormalCard extends Card {
  // An effect method takes an an unit and produce a new state of the unit.
  kind: CardCategory.NormalCard;
}

export abstract class EquippmentCard implements Card {
  kind = CardCategory.EquippmentCard;
  name = "";
  abstract effect(input: Unit): UnitStateDelta;
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
  constructor(
    public name: string,
    public cards: CardInit,
  ) {}
  async getAction(combatState: CombatState): Promise<Action> {
    throw new Error("Not Implemented");
  }
  getHealth(): number {
    return this.cards.equipped.map(
      (element) => element.effect(this).health || 0,
    ).reduce(
      (p, c) => p + c,
      0,
    );
  }

  getHealthLimit(): number {
    return this.cards.equipped.map(
      (element) => element.effect(this).healthLimit || 0,
    ).reduce(
      (p, c) => p + c,
    );
  }
  isDead(): boolean {
    return this.getHealth() <= 0;
  }
}

// A difference vector that represents the current state of the unit.
export interface UnitStateDelta {
  health?: number;
  healthLimit?: number;
}
