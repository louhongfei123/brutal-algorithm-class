import * as math from "./math.ts";

export enum CardCategory {
  NormalCard = "NormalCard",
  EquippmentCard = "EquippmentCard",
}

export interface EffectArguments {
  // The unit which played this card
  from: Unit;
  // The unit which was played against with this card
  to: Unit;
}

export interface Card {
  // kind is useful for both TSC checking and for JSON serialization.
  kind: CardCategory;
  name: string;
  desp?: string;
  effect(input: EffectArguments): CardEffect;
}

// A difference vector that represents the change of state of the unit.
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
  abstract effect(input: EffectArguments): CardEffect;
}

export interface Action extends EffectArguments {
  //   from: Unit;
  //   to: Unit;
  card: Card;
}

export interface CombatState {
  opponent: Unit;
}

export interface CardInit {
  // 抽牌堆
  drawPile: Card[];
  // 已装备的牌
  equipped: EquippmentCard[];
}

export interface CardsOfUnit extends CardInit {
  // 手牌
  hand: Card[];
  // 弃牌堆
  discardPile: Card[];
}

export class Unit {
  public cardEffects: CardEffect[] = [];
  public cards: CardsOfUnit = {
    hand: [],
    equipped: [],
    drawPile: [],
    discardPile: [],
  };

  constructor(
    public name: string,
    cards: CardInit,
  ) {
    this.cards.equipped = cards.equipped;
    this.cards.drawPile = cards.drawPile;
    for (let card of cards.equipped) {
      const effect = card.effect({
        from: this,
        to: this,
      });
      this.cardEffects.push(effect);
    }
  }

  async getAction(combatState: CombatState): Promise<Action> {
    throw new Error("Not Implemented");
  }

  // Draw n cards from draw pile to hand.
  // It turns the number of card that failed to be drawn.
  draw(n: number): number {
    for (let i = 0; i < n; i++) {
      let top = this.cards.drawPile.pop();
      if (!top) {
        return n - i;
      }
      this.cards.hand.push(top);
    }
    return 0;
  }

  // Move all cards in the discard pile to the draw pile and shuffle it.
  shuffle() {
    console.log(`${this.name} shuffles`);
    this.cards.drawPile = this.cards.discardPile;
    this.cards.discardPile = [];
    math.shuffle(this.cards.drawPile);
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
