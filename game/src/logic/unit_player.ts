import * as csp from "../lib/csp";
import {
    Unit,
    Card,
    CardInit,
    CombatState,
    Action,
    CardEffect,
    Missed,
} from "./interfaces";
import { Deque } from "./math";
import { BaseUnit } from "./unit_base";
import * as errors from "./errors";

export interface UserControlFunctions {
    getChoiceFromUser(): Promise<string>;
}

export interface UserCommunications {
    actions: csp.Channel<Action>;
    nextTurn: csp.Channel<void>;
}

export class MainCharactor extends BaseUnit {
    readonly myTurn = csp.chan<void>();
    readonly actionTaken: csp.Channel<Action> = new csp.UnbufferredChannel();
    readonly actionTakenMulticaster: csp.Multicaster<Action> = new csp
        .Multicaster(this.actionTaken);
    readonly actionTakenObserverToUI = this.actionTakenMulticaster.copy();
    actionMissed = csp.chan<void>();

    nextTurnCaster: csp.Multicaster<void>
    nextTurnListern1: csp.Channel<void>

    constructor(
        public name: string,
        cards: CardInit,
        public userCommunications: UserCommunications,
    ) {
        super(name, cards);
        this.nextTurnCaster = csp.multi(userCommunications.nextTurn);
        this.nextTurnListern1 = this.nextTurnCaster.copy();
    }

    addCardToDeck(card: Card) {
        this.cards.deck.push(card);
    }

    resetForNewCombat() {
        this.cardEffects = new Deque();
        this.init(this.cards);
    }

    async takeActions(combatState: CombatState): Promise<void> {
        let done = false;
        while (!done) {
            console.log("player is thinking");
            done = await csp.select([
                [this.userCommunications.actions, async (action) => {
                    console.log("userCommunications.actions");
                    const err = this.use(action.card, action.to);
                    console.log("telling the UI the action has been evaluated",);
                    if (err instanceof Missed) {
                        console.log('action is missed');
                        await this.actionMissed.put();
                        console.log('action is missed done');
                    }
                    await combatState.stateChange.put();
                    console.log("the UI has received the msg");
                    return false;
                }],
                [this.nextTurnListern1, async () => {
                    console.log("userCommunications.nextTurn");
                    return true;
                }],
            ]);
        }
    }
}
