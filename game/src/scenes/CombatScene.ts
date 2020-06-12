import Phaser from 'phaser';
import { AIUnit, MainCharactor } from "../logic/unit";
import * as card from "../logic/card";
import { Card, Action } from "../logic/interfaces";
import { Combat } from "../logic/combat";
import { log } from "../logic/logger";
import * as csp from "../lib/csp";



const GROUND_KEY = 'ground'
const DUDE_KEY = 'dude'
const STAR_KEY = 'star'
const BOMB_KEY = 'bomb'

export default class CombatScene extends Phaser.Scene {
    // @ts-ignore
    player: Phaser.Physics.Arcade.Sprite;
    // @ts-ignore
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    scoreLabel
    stars
    // @ts-ignore
    bombSpawner: BombSpawner
    gameOver = false
    combat: Combat

    userAction = new csp.UnbufferredChannel<Action>();

    constructor() {
        super('game-scene')

        const robber1 = new AIUnit("强盗1", {
            drawPile: [
                new card.Attack2(),
                new card.Attack2(),
            ],
            equipped: [
                new card.Health(1),
            ],
        });
        const robber2 = new AIUnit("强盗2", {
            drawPile: [
                new card.Attack3(),
                new card.Attack3(),
                new card.FollowUpAttack(),
            ],
            equipped: [
                new card.Health(5),
            ],
        });

        const userCardSelection = new csp.UnbufferredChannel<any>();
        const userControlFunctions = {
            getChoiceFromUser: async function () {
                return userCardSelection.pop();
            },
        };

        const mainC = new MainCharactor(
            "主角",
            {
                drawPile: [
                    new card.Attack1(),
                    new card.Attack1(),
                    new card.Heal(),
                ],
                equipped: [
                    new card.Health(5),
                ],
            },
            // new csp.UnbufferredChannel<string>(),
            // userControlFunctions,
            {
                actions: this.userAction
            }
        );
        // Start the campagin
        this.combat = new Combat(mainC, robber1);
    }

    preload() {
        this.load.image('sky', 'assets/sky.png')
        this.load.image(GROUND_KEY, 'assets/platform.png')
        this.load.image(STAR_KEY, 'assets/star.png')
        this.load.image(BOMB_KEY, 'assets/bomb.png')

        this.load.spritesheet(DUDE_KEY,
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        )
    }

    async create() {
        this.combat.begin();
        this.add.image(400, 300, 'sky')
        await this.combat.onStateChange().pop();
        const handCards = await this.createHandCards(this, this.combat);
        const enermy = await this.createEnermy(this, this.combat);
        // console.log(93, handCards.children.entries[0], enermy);

        // let overlapping = false;
        this.physics.add.overlap(handCards, enermy, async (handCard, enermy) => {
            // console.log("overlap! 2");
            // overlapping = true;
            let pointer = this.input.activePointer;
            if(!pointer.isDown) {
                // submit an action to the combat.
                let action: Action = {
                    from: this.combat.getUnitOfThisTurn(),
                    to: this.combat.getOpponent(),
                    card: handCard.getData('model')
                }
                console.log(action);
                handCard.destroy();
                // handCard.setActive(false);
                await this.userAction.put(action);
            }
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });


    }

    async createHandCards(scene: Phaser.Scene, combat: Combat): Promise<Phaser.GameObjects.Group> {
        const hand = combat.getUnitOfThisTurn().cards.hand;
        console.log(hand);
        const cards: Phaser.GameObjects.Rectangle[] = [];
        for (let i = 0; i < hand.length; i++) {
            const rect = this.add.rectangle(200 + 74 * i, 550, 74, 148, 0x6666ff);
            rect.setStrokeStyle(4, 0xefc53f);
            rect.setInteractive();
            this.input.setDraggable(rect);
            cards.push(rect);
            rect.setData('model', hand[i]);
            // console.log(rect);
            this.physics.add.existing(rect);
        }
        return new Phaser.GameObjects.Group(scene, cards)
    }

    async createEnermy(scene: Phaser.Scene, combat: Combat): Promise<Phaser.GameObjects.Rectangle> {
        // const enermy = combat.getOpponent();
        const enermy = this.add.rectangle(600, 250, 74, 148, 0x6666ff);
        enermy.setInteractive();
        this.input.setDraggable(enermy);
        this.physics.add.existing(enermy);
        return enermy
    }
    update() {
        for(let i = 0; i < 1; i++) {
            // console.log('123');
        }
        
    }

}
