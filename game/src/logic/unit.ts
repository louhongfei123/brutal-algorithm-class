import * as csp from "../lib/csp";
import { log } from "./logger";
import { Unit, Card, CardInit, CombatState, Action, CardEffect } from "./interfaces";
import * as math from './math';
import { Deque } from './math';
import { InvalidBehavior } from './errors';
import * as card from './card';

export abstract class BaseUnit implements Unit {
  public cardEffects: Deque<CardEffect> = new Deque();

  constructor(
    public name: string,
    protected readonly cards: CardInit
  ) {

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

  abstract async takeAction(combatState: CombatState): Promise<Action>;

  // resolves when it is this unit's turn
  abstract waitForTurn(): csp.Channel<undefined>;

  abstract async observeActionTaken(): Promise<Action>;

  draw(n: number) {
    const draw1 = new card.Draw1();
    for (let i = 0; i < n; i++) {
      const effect = draw1.effect({
        from: this,
        to: this
      })
      if (effect instanceof InvalidBehavior) {
        console.warn(effect.message);
        break;
      }
      this.cardEffects.push(effect.to);
    }
  }

  shuffle() {
    const shuffle = new card.Shuffle();
    const effect = shuffle.effect({
      from: this,
      to: this
    })
    if (effect instanceof InvalidBehavior) {
      throw effect;
    }
    this.cardEffects.push(effect.to);
  }

  use(card: Card, to: Unit): InvalidBehavior | undefined {
    const effects = card.effect({ from: this, to: to });
    if (effects instanceof Error) {
      return effects
    }
    // todo: why the order of from & to change the result
    if (effects.from) {
      this.cardEffects.push(effects.from);
    }
    if (effects.to) {
      to.cardEffects.push(effects.to);
    }
    if (!effects.from && !effects.to) {
      throw new Error();
    }
  }

  private reduceCurrentState(name: string): Deque<Card> | undefined {
    let history = this.cardEffects
      .filter(effect => effect[name])
      .map(effect => effect[name])
    const cards = history.slice(-1)[0];
    if (!cards) {
      return undefined;
    }
    return cards
  }

  getHand(): Deque<Card> {
    const hand = this.reduceCurrentState('handCard');
    if (!hand) {
      return new Deque();
    }
    return hand;
  }

  getDrawPile(): Deque<Card> {
    const drawPile = this.reduceCurrentState('drawPile');
    if (!drawPile) {
      return this.cards.drawPile;
    }
    return drawPile;
  }

  getDiscardPile(): Deque<Card> {
    const discard = this.reduceCurrentState('discardPile');
    if (!discard) {
      return new Deque();
    }
    return discard;
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

export interface UserControlFunctions {
  getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
  actions: csp.Channel<Action>;
}

export class MainCharactor extends BaseUnit {
  readonly myTurn: csp.Channel<undefined> = new csp.UnbufferredChannel();
  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  constructor(
    public name: string,
    cards: CardInit,
    // public choiceChan: csp.Channel<string>,
    // public userControlFunctions: UserControlFunctions,
    private userCommunications: UserCommunications
  ) {
    super(name, cards);
    console.log(this.cards)
  }

  // This function communicates with the Combat and user.
  async takeAction(combatState: CombatState): Promise<Action> {
    console.log("main charactor needs to take action");
    await this.myTurn.put(undefined);
    const action = await this.userCommunications.actions.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    console.log("game logic received", action);
    // this.actionTaken.put(action);
    return action;
  }

  waitForTurn() {
    return this.myTurn;
  }

  // This function communicates with any outside system other than the Combat
  // that is interested to observe action taken by this unit.
  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTaken.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    return action;
  }
}

export class AIUnit extends BaseUnit {
  readonly chan = csp.chan<undefined>();
  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  constructor(public name: string, cards: CardInit) {
    super(name, cards);
  }

  async takeAction(combatState: CombatState): Promise<Action> {
    await log("AI is taking actions");
    await this.chan.put(undefined);
    const action = {
      from: this,
      to: combatState.opponent,
      card: math.randomPick(this.getHand())
    };
    await this.actionTaken.put(action);
    return action;
  }

  // There is no need to wait for AI.
  waitForTurn() {
    return this.chan;
  }

  async observeActionTaken(): Promise<Action> {
    const action = await this.actionTaken.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    return action;
  }

  getDeck() {
    return this.cards.drawPile;
  }
}
