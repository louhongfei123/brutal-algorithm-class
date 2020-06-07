import { Card, Unit } from "./interfaces.ts";

export class Attack implements Card {
  name = Attack.name;
  constructor() {}
  effect(input: Unit): Unit {
    input.health -= 10;
    return input;
  }
}

export class Heal implements Card {
  name = Heal.name;
  constructor() {}
  effect(input: Unit): Unit {
    input.health += 5;
    return input;
  }
}
