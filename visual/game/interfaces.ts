export interface Card {
  // An effect method takes an an unit and produce a new state of the unit.
  name: string;
  effect(input: Unit): Unit;
}

export interface Action {
  from: Unit;
  to: Unit;
  card: Card;
}

export interface CombatState {
  opponent: Unit;
}

export class Unit {
  constructor(
    public name: string,
    public health: number,
    public cards: Card[],
  ) {}
  async getAction(combatState: CombatState): Promise<Action> {
    throw new Error("Not Implemented");
  }
}
