import Phaser from 'phaser';
import { AIUnit, MainCharactor } from "../logic/unit";
import * as card from "../logic/card";
import { Card } from "../logic/interfaces";
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
            new csp.UnbufferredChannel<string>(),
            userControlFunctions,
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

        // new Phaser.GameObjects.Rectangle();


        // const platforms = this.createPlatforms()
        // this.player = this.createPlayer()
        // this.stars = this.createStars()

        // this.scoreLabel = this.createScoreLabel(16, 16, 0)

        // this.bombSpawner = new BombSpawner(this, BOMB_KEY)
        // const bombsGroup = this.bombSpawner.group

        // this.physics.add.collider(this.player, platforms)
        // this.physics.add.collider(this.stars, platforms)
        // this.physics.add.collider(bombsGroup, platforms)
        // this.physics.add.collider(this.player, bombsGroup, this.hitBomb, null, this)

        // this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

        // this.cursors = this.input.keyboard.createCursorKeys()
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
            this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });
            cards.push(rect);
            console.log(rect);
        }
        return new Phaser.GameObjects.Group(scene, cards)
    }

    async createEnermy(scene: Phaser.Scene, combat: Combat): Promise<Phaser.GameObjects.Rectangle> {
        const hand = combat.getOpponent();
        return this.add.rectangle(600, 250, 74, 148, 0x6666ff);
    }
    update() {
        // if (this.gameOver) {
        //     return
        // }
        // if (this.cursors.left.isDown) {
        //     this.player.setVelocityX(-160)

        //     this.player.anims.play('left', true)
        // }
        // else if (this.cursors.right.isDown) {
        //     this.player.setVelocityX(160)

        //     this.player.anims.play('right', true)
        // }
        // else {
        //     this.player.setVelocityX(0)

        //     this.player.anims.play('turn')
        // }

        // if (this.cursors.up.isDown && this.player.body.touching.down) {
        //     this.player.setVelocityY(-330)
        // }
    }

    createPlatforms() {
        const platforms = this.physics.add.staticGroup()

        platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody()

        platforms.create(600, 400, GROUND_KEY)
        platforms.create(50, 250, GROUND_KEY)
        platforms.create(750, 220, GROUND_KEY)
        return platforms
    }

    createPlayer() {
        const player = this.physics.add.sprite(100, 450, DUDE_KEY)
        player.setBounce(0.2)
        player.setCollideWorldBounds(true)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'turn',
            frames: [{ key: DUDE_KEY, frame: 4 }],
            frameRate: 20
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
        return player;
    }

    createStars() {
        const stars = this.physics.add.group({
            key: STAR_KEY,
            repeat: 12,
            setXY: { x: 12, y: 0, stepX: 70 }
        })

        stars.children.iterate((child) => {
            // @ts-ignore
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        })

        return stars
    }

    hitBomb(player, bomb) {
        this.physics.pause()

        player.setTint(0xff0000)

        player.anims.play('turn')

        this.gameOver = true
    }
}
