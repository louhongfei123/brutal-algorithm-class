import Phaser from "phaser";
import * as csp from "../lib/csp";

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
