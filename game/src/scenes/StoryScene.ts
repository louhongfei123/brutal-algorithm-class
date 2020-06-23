import Phaser from "phaser";
import * as ui from "../ui";
import CombatScene from "./CombatScene";
import LevelListScene from "./LevelList";
import * as csp from "../lib/csp";
import { Combat } from '../logic/combat';

export default class StoryScene extends Phaser.Scene {

    preload() {

        // this.load.image("start-menu", "assets/start-menu.jpg");

    }

    async create() {

        let story = [
            "西是前朝公主。20年前，新王杀死了皇帝。那时还是3岁孩童的她被宫人秘密送出，逃往了迷雾秘境。这20年来，新王一直在寻找皇帝祭坛的开启方法。因为只要寻得了祭坛中的秘宝，便可让复国派的叛乱者们束手就擒。传言，只有皇室之血可以开启祭坛。所以，新王也一直在寻找西的下落。新王屡次派人进入迷雾秘境，都有去无回。\n\n如今，西已经长大成人。她在迷雾秘境中跟随复国派的武者日夜修炼，习得了秘法。现在，她踏上了了回到大陆的旅途，只身前往皇帝祭坛。只要能够开启祭坛，得到皇帝秘宝，她便能反抗新王。复仇之路开始了",
            "经过10日夜的奔袭，西终于来到了帝山脚下。此山是昔日皇族祭祀之山。皇帝祭坛就在山顶。如今，新王派了重兵把守。只有等到晚上，绕开巡逻，靠近皇帝祭坛。",
            "西来到了皇帝祭坛面前。这是她第一次见到。和迷雾秘境中师父讲述的不同。皇帝祭坛并不是一个宗庙，也不是神像之类的朝拜之物。而是一泊水潭。水潭清澈得如同空气，倒映着月光和天空。蓝得让人失神。",
            "西：是时候打开祭坛了。唯有皇族之血可以打开祭坛。那么，是要我割血喂这湖泊吗？",
            "西毫不犹豫，抽出腰上短刀，割破手臂，鲜血流入泊中。顿时，湖泊从蓝转红。赤如烈焰。湖面形成了一个漩涡，将西吸了进去。",
            "...",
            "西醒了过来",
            "西：我被传送到了祭坛内部吗？这里没有窗户、也没有火焰，但是确清晰可见。好似墙壁本身就在发光。"
        ]

        let continueButton = csp.chan<void>();
        const button = ui.button(this, "Continue", {
            x: ui.centerX(this),
            y: ui.centerY(this) * 1.8,
            width: 400,
            height: 80
        })
        button.rect.on('pointerdown', async (pointer) => {
            await continueButton.put()
        });


        const storyArea = this.make.text({
            x: ui.centerX(this),
            y: ui.centerY(this),
            text: "",
            origin: { x: 0.5, y: 0.5 },
            style: {
                wordWrap: { width: 800, useAdvancedWrap: true },
                padding: {
                    y: 300
                }
            }
        })
        storyArea.setFontSize(50);


        // display the story
        for (let text of story) {
            await displayText(storyArea, text)
            await continueButton.pop();
        }
        // await continueButton.pop();
        console.log('61');
        this.scene.remove(this);
        const scene = new LevelListScene()
        this.scene.add(LevelListScene.name, scene, true)
    }
}

async function displayText(textArea: Phaser.GameObjects.Text, text: string) {
    for (let i = 0; i < text.length; i++) {
        // await csp.sleep(50)
        textArea.setText(text.slice(0, i))
    }
}
