import { Card, Unit } from "./interfaces.ts";

export class Attack implements Card {
  name = Attack.name;
  constructor() {}
  effect(input: Unit): Unit {
    // todo: what is the best way to do immutable in JS?
    input.health -= 10;
    return input;
  }
}

export class Heal implements Card {
  name = Heal.name;
  constructor() {}
  // todo: when choose heal, should ask the user to select the target instead of applying to the opponent directly
  effect(input: Unit): Unit {
    input.health += 5;
    return input;
  }
}
