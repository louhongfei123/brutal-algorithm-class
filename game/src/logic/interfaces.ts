import * as math from "./math";
import { Deque } from "./math";
import * as csp from "../lib/csp";
import { InvalidBehavior } from './errors';
import { Combat } from './combat';


export enum CardCategory {
  NormalCard = "NormalCard",
  AttackCard = "AttackCard",
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
  stateChange: csp.Channel<void>;
}

export interface CardInit {
  // 抽牌堆
  readonly drawPile: math.Deque<Card>;
  // 已装备的牌
  readonly equipped: math.Deque<EquippmentCard>;
}

// A difference vector that represents the change of state of the unit.
export interface CardEffect {
  by: Card
  // delta
  health?: number
  healthLimit?: number
  agility?: number
  // current state
  handCard?: Deque<Card>
  drawPile?: Deque<Card>
  discardPile?: Deque<Card>
}

export interface Unit {
  cardEffects: Deque<CardEffect>;
  name: string

  // coordinations
  takeActions(combatState: CombatState): Promise<void>;
  observeActionTaken(): Promise<Action>;
  
  // mutations
  draw(n: number)
  shuffle()
  use(card: Card, to: Unit, combat: Combat): InvalidBehavior | void
  
  // observations
  getHand(): Deque<Card>
  getDrawPile(): Deque<Card>
  getDiscardPile(): Deque<Card>
  getHealth(): number
  getHealthLimit(): number
  // Agility determines the hit rate and the action order
  getAgility(): number
  isHit(from: Unit): boolean
  isDead(): boolean
}
