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

export interface Unit {
  cardEffects: Deque<CardEffect>;
  name: string
  takeAction(combatState: CombatState): Promise<Action>;
  // resolves when it is this unit's turn
  waitForTurn(): csp.Channel<undefined>;
  observeActionTaken(): Promise<Action>;
  
  // mutations
  draw(n: number)
  shuffle()
  use(card: Card, to: Unit): InvalidBehavior | undefined
  
  // observations
  getHand(): Deque<Card>
  getDrawPile(): Deque<Card>
  getDiscardPile(): Deque<Card>
  getHealth(): number
  getHealthLimit(): number
  isDead(): boolean
}
