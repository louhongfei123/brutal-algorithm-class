import * as math from "./math";
import { Deque } from "./math";
import * as csp from "../lib/csp";
import { InvalidBehavior } from './errors';

export enum CardCategory {
  NormalCard = "NormalCard",
  EquippmentCard = "EquippmentCard",
}

export interface EffectArguments {
  // The unit which played this card
  // source
  from: Unit;
  // The unit which was played against with this card
  // target
  to: Unit;
}

export interface Card {
  // kind is useful for both TSC checking and for JSON serialization.
  kind: CardCategory;
  name: string;
  desp?: string;
  effect(input: EffectArguments): { from?: CardEffect, to?: CardEffect } | InvalidBehavior;
}

// A difference vector that represents the change of state of the unit.
export interface CardEffect {
  by: Card
  // delta
  health?: number
  healthLimit?: number
  // current state
  handCard?: Deque<Card>
  drawPile?: Deque<Card>
  discardPile?: Deque<Card>
}

export interface NormalCard extends Card {
  // An effect method takes an an unit and produce a new state of the unit.
  kind: CardCategory.NormalCard;
}

export abstract class EquippmentCard implements Card {
  kind = CardCategory.EquippmentCard;
  name = "";
  abstract effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | InvalidBehavior;
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
  readonly drawPile: math.Deque<Card>;
  // 已装备的牌
  readonly equipped: math.Deque<EquippmentCard>;
}

// export interface CardsOfUnit extends CardInit {
//   // 手牌
//   readonly hand: math.Deque<Card>;
//   // 弃牌堆
//   readonly discardPile: math.Deque<Card>;
// }

export abstract class Unit {
  public cardEffects: Deque<CardEffect> = new Deque();
  // protected readonly cards: CardsOfUnit = {
  //   hand: new math.Deque(),
  //   equipped: new math.Deque(),
  //   drawPile: new math.Deque(),
  //   discardPile: new math.Deque(),
  // };

  constructor(
    public name: string,
    protected readonly cards: CardInit
  ) {
    // this.cards.equipped = cards.equipped;
    // this.cards.drawPile = cards.drawPile;

    // apply effects of equippments
    for (let card of cards.equipped) {
      const effect = card.effect({
        from: this,
        to: this,
      });
      if (effect instanceof InvalidBehavior) {
        throw effect
      }
      this.cardEffects.push(effect.to);
    }
  }

  assertEffectsValidity() {
    const effects = this.cardEffects
    let hand = new Deque();
    let draw = this.cards.drawPile;
    let discard = new Deque();
    for (let effect of effects) {
      if (effect.handCard && effect.handCard.length !== hand.length - 1) {
        throw new Error();
      }
      if (effect.discardPile && effect.discardPile.length !== discard.length + 1) {
        throw new Error();
      }
      if (
        effect.discardPile &&
        effect.handCard &&
        effect.drawPile &&
        effect.discardPile.length + effect.handCard.length + effect.drawPile.length !==
        discard.length + hand.length + draw.length
      ) {
        throw new Error();
      }
      hand = effect.handCard? effect.handCard: hand;
      draw = effect.drawPile? effect.drawPile: draw;
      discard = effect.discardPile? effect.discardPile: discard;
    }
  }

  abstract async takeAction(combatState: CombatState): Promise<Action>;

  // resolves when it is this unit's turn
  abstract waitForTurn(): csp.Channel<undefined>;

  abstract async observeActionTaken(): Promise<Action>;

  // Move all cards in the discard pile to the draw pile and shuffle it.
  // shuffle() {
  //   console.log(`${this.name} shuffles`);
  //   this.cards.drawPile = this.cards.discardPile;
  //   this.cards.discardPile = new Deque();
  //   math.shuffle(this.cards.drawPile);
  // }

  // moveToDiscardFromHand(card: Card) {
  //   console.log(this.cards.hand, this.cards.discardPile);
  //   for (let [i, c] of this.cards.hand.entries()) {
  //     if (c === card) {
  //       const [card2, newHand] = math.popFrom(this.cards.hand, i);
  //       if (card2 !== card) {
  //         throw new Error("unreachable");
  //       }
  //       // @ts-ignore
  //       this.cards.hand = newHand;
  //       this.cards.discardPile.push(card2);
  //       console.log(this.cards.hand, this.cards.discardPile);
  //       return;
  //     }
  //   }
  //   throw new Error(`card: ${card} does not exist in hand`);
  // }

  private reduceCurrentState(name: string): Deque<Card> {
    let history = this.cardEffects
      .filter(effect => effect[name])
      .map(effect => effect[name])
    const cards = history.slice(-1)[0];
    if (!cards) {
      return new Deque();
    }
    return cards
  }

  getHand(): Deque<Card> {
    return this.reduceCurrentState('handCard');
  }

  getDrawPile(): Deque<Card> {
    return this.reduceCurrentState('drawPile');
  }

  getDiscardPile(): Deque<Card> {
    return this.reduceCurrentState('discardPile');
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
