import {
  Card,
  Unit,
  CardEffect,
  EquippmentCard,
  CardCategory,
} from "./interfaces.ts";

export class Attack1 implements Card {
  name = Attack1.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: Unit): CardEffect {
    return {
      by: this,
      health: -1,
    };
  }
}

export class Attack2 implements Card {
  name = Attack2.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: Unit): CardEffect {
    return {
      by: this,
      health: -2,
    };
  }
}

export class Attack3 implements Card {
  name = Attack2.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: Unit): CardEffect {
    return {
      by: this,
      health: -3,
    };
  }
}

export class Heal implements Card {
  kind = CardCategory.NormalCard;
  name = Heal.name;
  constructor() {}
  effect(input: Unit): CardEffect {
    let health = 5;
    // console.log("getHealth", input.getHealth());
    // console.log("getHealthLimit", input.getHealthLimit());
    if (input.getHealth() + health > input.getHealthLimit()) {
      health = input.getHealthLimit() - input.getHealth();
    }
    // console.log("effect", health);
    return {
      by: this,
      health: health,
    };
  }
}

export class Health extends EquippmentCard {
  name = Health.name;
  health = 5;
  constructor() {
    super();
  }
  effect(input: Unit): CardEffect {
    return {
      by: this,
      health: this.health,
      healthLimit: this.health,
    };
  }
}
