import * as csp from "../lib/csp";
import { log } from "./logger";
import { Unit, Card, CardInit, CombatState, Action, CardEffect, Missed } from "./interfaces";
import * as math from './math';
import { Deque } from './math';
import { InvalidBehavior } from './errors';
import { BaseUnit } from './unit_base';

export interface UserControlFunctions {
  getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
  actions: csp.Channel<Action>;
  nextTurn: csp.Channel<undefined>;
}

export class MainCharactor extends BaseUnit {
  readonly myTurn = csp.chan<void>();
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

  addCardToDrawPile(card: Card) {
    // this.cards.drawPile.push(card);
    const drawPile = this.getDrawPile()
    this.cardEffects.push({
      by: card,
      drawPile: new Deque(...drawPile.concat(card))
    })
  }

  async takeActions(combatState: CombatState): Promise<void> {
    let done = false;
    while (!done) {
      console.log('player is thinking');
      done = await csp.select([
        [this.userCommunications.actions, async (action) => {
          console.log('userCommunications.actions');
          const err = this.use(action.card, action.to)
          console.log(err);
          console.log(combatState.stateChange, 'telling the UI the action has been evaluated');
          await combatState.stateChange.put()
          console.log('the UI has received the msg');
          return false;
        }],
        [this.userCommunications.nextTurn, async () => {
          console.log('userCommunications.nextTurn')
          return true;
        }]
      ]);
    }
  }

  async goToNextTurn() {
    await this.userCommunications.nextTurn.pop();
  }
  async goToNextTurnChan() {
    return this.userCommunications.nextTurn;
  }
}

export class AIUnit extends BaseUnit {
  readonly myTurn = csp.chan<void>();

  readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
  readonly actionTakenMulticaster: csp.Multicaster<Action> = new csp.Multicaster(this.actionTaken)
  readonly actionTakenObserverToUI = this.actionTakenMulticaster.copy()
  // readonly actionTakenObserverToCombat = this.actionTakenMulticaster.copy()
  readonly goToNexTurnChan_ = csp.chan<undefined>();

  constructor(public name: string, cards: CardInit) {
    super(name, cards);
  }

  async takeActions(combatState: CombatState): Promise<void> {
    // find one valid action
    let action: Action | undefined;
    while (action === undefined) {
      // const action = {
      //   from: this,
      //   to: combatState.opponent,
      //   card: 
      // };
      const card: Card = math.randomPick(this.getHand());
      // check if this action is valid
      const err = card.effect({ from: this, to: combatState.opponent })
      if (err instanceof InvalidBehavior) {
        console.log(err);
        continue;
      }
      action = {
        from: this,
        to: combatState.opponent,
        card: card
      }
    }
    await this.actionTaken.put(action);
  }

  async observeActionTaken(): Promise<Action> {
    // todo: need to change to implementation to work with commit
    const action = await this.actionTakenObserverToUI.pop();
    if (!action) {
      throw new Error("unreachable");
    }
    return action;
  }

  // use(card: Card, to: Unit): InvalidBehavior | void {
  //   // todo
  // }

  commit(action: Action): Missed | void {
    const err = this.use(action.card, action.to)
    if (err instanceof InvalidBehavior) {
      throw err;
    }
    return err;
  }

  getDeck() {
    return this.cards.drawPile;
  }

  async goToNextTurnChan() {
    return this.goToNexTurnChan_;
  }
}
