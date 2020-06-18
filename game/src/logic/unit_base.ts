import * as csp from "../lib/csp";
import { Combat } from './combat';
import {
    Unit, Card, CardInit, CombatState, Action, CardEffect,
} from "./interfaces";
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

    abstract takeActions(combatState: CombatState): Promise<void>;
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

    use(card: Card, to: Unit): InvalidBehavior | void {
        const effects = card.effect({ from: this, to: to });
        if (effects instanceof Error) {
            return effects
        }
        // todo: why the order of from & to change the result
        if (effects.from) {
            this.cardEffects.push(effects.from);
        }
        if (effects.to) {
            if (card.kind === 'AttackCard') {
                // calculate hit rate
                if (to.isHit(this)) {
                    to.cardEffects.push(effects.to);
                } else {
                    console.log('missed');
                }
            } else {
                to.cardEffects.push(effects.to);
            }
        }
        if (!effects.from && !effects.to) {
            throw new Error();
        }
    }

    isHit(from: Unit): boolean {
        return Math.random() <= from.getAgility() / this.getAgility()
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
        if (health > this.getHealthLimit()) {
            throw new Error('health > this.getHealthLimit()')
        }
        return health;
    }

    getHealthLimit(): number {
        return this.cardEffects
            .map((element) => element.healthLimit || 0)
            .reduce((p, c) => p + c);
    }

    getAgility(): number {
        return this.cardEffects
            .map((element) => element.agility || 0)
            .reduce((p, c) => p + c);
    }

    isDead(): boolean {
        return this.getHealth() <= 0;
    }
}
