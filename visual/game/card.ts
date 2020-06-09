import {
  Card,
  Unit,
  CardEffect,
  EquippmentCard,
  CardCategory,
  EffectArguments,
} from "./interfaces.ts";

export class Attack1 implements Card {
  name = Attack1.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
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
  effect(input: EffectArguments): CardEffect {
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
  effect(input: EffectArguments): CardEffect {
    return {
      by: this,
      health: -3,
    };
  }
}

export class FollowUpAttack implements Card {
  name = FollowUpAttack.name;
  desp = "If the previous used/discard card is an attack, duplicate its effect";
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
    if (input.from.cards.discardPile.length === 0) {
      return { by: this };
    }
    console.log(JSON.stringify(input.from.cards.discardPile));
    return input.from.cards.discardPile[input.from.cards.discardPile.length - 1]
      .effect(input);
  }
}

export class Heal implements Card {
  kind = CardCategory.NormalCard;
  name = Heal.name;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
    let health = 5;
    // console.log("getHealth", input.getHealth());
    // console.log("getHealthLimit", input.getHealthLimit());
    if (input.to.getHealth() + health > input.to.getHealthLimit()) {
      health = input.to.getHealthLimit() - input.to.getHealth();
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
  effect(input: EffectArguments): CardEffect {
    return {
      by: this,
      health: this.health,
      healthLimit: this.health,
    };
  }
}
