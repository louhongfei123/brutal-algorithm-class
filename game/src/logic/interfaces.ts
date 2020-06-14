import * as math from "./math";
import * as csp from "../lib/csp";

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
  from: Unit;
  to: Unit;
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

export abstract class Unit {
  public cardEffects: CardEffect[] = [];
  public cards: CardsOfUnit = {
    hand: [],
    equipped: [],
    drawPile: [],
    discardPile: [],
  };

  constructor(public name: string, cards: CardInit) {
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

  abstract async takeAction(combatState: CombatState): Promise<Action>;

  // resolves when it is this unit's turn
  abstract waitForTurn(): csp.Channel<undefined>;

  abstract async observeActionTaken(): Promise<Action>;

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

  moveToDiscardFromHand(card: Card) {
    console.log(this.cards.hand, this.cards.discardPile);
    for (let [i, c] of this.cards.hand.entries()) {
      if (c === card) {
        const [card2, newHand] = math.popFrom(this.cards.hand, i);
        if (card2 !== card) {
          throw new Error("unreachable");
        }
        this.cards.hand = newHand;
        this.cards.discardPile.push(card2);
        console.log(this.cards.hand, this.cards.discardPile);
        return;
      }
    }
    throw new Error(`card: ${card} does not exist in hand`);
  }

  getHealth(): number {
    const health = this.cardEffects
      .map((element) => element.health || 0)
      .reduce((p, c) => p + c, 0);
    return health;
  }

  getHealthLimit(): number {
    return this.cardEffects
      .map((element) => element.healthLimit || 0)
      .reduce((p, c) => p + c);
  }
  isDead(): boolean {
    return this.getHealth() <= 0;
  }
}

/*

todos

I probably need a deque implementation that represents a deck of cards
that can insert and remove cards from/to top, bottom, and random middle place of the deque.

Probably time to write some reproducible tests. Currently there are 488 lines of code.
Let's see how it goes. If the code starts to not able to be fit in my head at once,
time to write test code.

*/
