import {
  Card,
  Unit,
  UnitStateDelta,
  EquippmentCard,
  CardCategory,
} from "./interfaces.ts";

export class Attack1 implements Card {
  name = Attack1.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: Unit): UnitStateDelta {
    return {
      health: -1,
    };
  }
}

export class Attack2 implements Card {
  name = Attack2.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: Unit): UnitStateDelta {
    return {
      health: -2,
    };
  }
}

export class Attack3 implements Card {
  name = Attack2.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: Unit): UnitStateDelta {
    return {
      health: -2,
    };
  }
}

export class Heal implements Card {
  kind = CardCategory.NormalCard;
  name = Heal.name;
  health = 5;
  constructor() {}
  effect(input: Unit): UnitStateDelta {
    let health = this.health;
    if (health > input.getHealthLimit()) {
      health = input.getHealthLimit();
    }
    return {
      health: health,
    };
  }
}

export class Health extends EquippmentCard {
  name = Health.name;
  health = 6;
  constructor() {
    super();
  }
  effect(input: Unit): UnitStateDelta {
    return {
      health: this.health,
      healthLimit: this.health,
    };
  }
}
