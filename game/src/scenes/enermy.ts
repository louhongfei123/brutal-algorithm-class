import Phaser from "phaser";
import { Combat } from "../logic/combat";
import CombatScene from "./CombatScene";

export function refreshEnermy(
  scene: CombatScene,
  combat: Combat,
): Phaser.GameObjects.Container {
  if (scene.enermyContainer) {
    scene.enermyContainer.destroy();
  }
  const container = scene.add.container(650 * 2, 250 * 2);

  // Add enermy image
  const enermy = scene.add.image(0, 0, "girl_1");
  enermy.setScale(0.6);

  // Add enermy text
  const text = scene.add.text(50, -75, combat.enermy.name);
  text.setFontSize(70);

  // Display enermy health point
  const health = combat.enermy.getHealth();
  const healthLimit = combat.enermy.getHealthLimit();
  const healthText = scene.add.text(
    -enermy.width * enermy.scale / 4,
    -enermy.height * enermy.scale / 1.5,
    `${health}/${healthLimit}`,
  );
  healthText.setFontSize(50);

  // Add parts to the container
  container.add(enermy);
  container.add(text);
  container.add(healthText);
  container.setData("model", combat.enermy);

  scene.physics.add.existing(container);
  scene.enermyContainer = container;
  return container;
}
