import Phaser from "phaser";
import * as csp from "../lib/csp";
import {
    Card, Action, EquippmentCard,
    Missed
} from "../logic/interfaces";

export async function moveTo(scene, source, destination, speed, maxtime?): Promise<void> {
    scene.physics.moveToObject(source, destination, speed, maxtime);
    while (true) {
        await csp.sleep(16.6); // 60 fps
        var distance = Phaser.Math.Distance.Between(source.x, source.y, destination.x, destination.y);
        // https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html#moveTo__anchor
        // moveTo moves to the direction indefinitely without stop.
        // https://phaser.io/examples/v3/view/physics/arcade/move-and-stop-at-position
        if (distance < 10) {
            source.body.reset(destination.x, destination.y);
            return;
        }
    }
}

export async function renderMissed(scene: Phaser.Scene, duration: number) {
    // todo
    let text = scene.add.text(centerX(scene), centerY(scene), 'Missed')
    text.setFontSize(100)
    text.setOrigin(0.5, 0.5)
    await csp.sleep(duration)
    text.destroy()
}

export async function renderVictory(scene: Phaser.Scene, duration: number) {
    // todo
    let text = scene.add.text(centerX(scene), centerY(scene), 'Victory')
    text.setFontSize(100)
    text.setOrigin(0.5, 0.5)
    await csp.sleep(duration)
    text.destroy()
}

export async function renderLost(scene: Phaser.Scene, duration: number) {
    // todo
    let text = scene.add.text(centerX(scene), centerY(scene), 'Lost')
    text.setFontSize(100)
    text.setOrigin(0.5, 0.5)
    await csp.sleep(duration)
    text.destroy()
}

export function centerX(scene: Phaser.Scene): number {
    return scene.sys.canvas.width / 2;
}

export function centerY(scene): number {
    return scene.sys.canvas.height / 2;
}

export function renderCard(scene: Phaser.Scene, card: Card, x, y, width, height): Phaser.GameObjects.Container {
    // create a container
    const color = 0x6666ff;
    const cardContainer = scene.add.container(x, y);

    // create children of the container
    const rect = scene.add.rectangle(0, 0, width, height, color);
    rect.setStrokeStyle(4, 0xefc53f);
    const text = scene.add.text(-70, -120, card.name);
    text.setFontSize(35)
    cardContainer.add(rect);
    cardContainer.add(text);

    // make the container interactive
    cardContainer.setSize(rect.width, rect.height);

    // add the container to the physics system
    scene.physics.add.existing(cardContainer);
    cardContainer.setData("model", card);
    return cardContainer;
}


interface buttonOption {
    x: number
    y: number
    width: number
    height: number
    fontSize?: number
}
export function button(scene: Phaser.Scene, text: string, option: buttonOption) {

    let {x, y, width, height, fontSize} = option
    if(!fontSize) { fontSize = 66}

    const container = scene.add.container(x, y);

    // create children of the container
    const rectOnHover = scene.add.rectangle(0, 0, width, height, 0xff0000);
    const rectNoHover = scene.add.rectangle(0, 0, width, height, 0x6666ff);
    const textObj = scene.add.text(0, 0, text)
        .setFontSize(fontSize)
        .setOrigin(0.5)

    container.add(rectOnHover)
    container.add(rectNoHover)
    container.add(textObj)

    rectNoHover.setInteractive()
    rectNoHover.on('pointerover', async () => {
        rectNoHover.setVisible(false);
    })

    rectOnHover.setInteractive()
    rectOnHover.on('pointerout', async () => {
        rectNoHover.setVisible(true);
    })
    return {
        conatiner: container,
        rect: rectOnHover
    }
}