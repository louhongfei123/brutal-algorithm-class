import {
  Card,
  Unit,
  CardEffect,
  EquippmentCard,
  CardCategory,
  EffectArguments,
} from "./interfaces";

//////////////////
// Attack Cards //
//////////////////
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
  name = Attack3.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
    return {
      by: this,
      health: -3,
    };
  }
}

export class Attack4 implements Card {
  name = Attack4.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
    return {
      by: this,
      health: -4,
    };
  }
}

export class Attack5 implements Card {
  name = Attack5.name;
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
    return {
      by: this,
      health: -5,
    };
  }
}

export class FollowUpAttack implements Card {
  name = FollowUpAttack.name;
  desp =
    "If the previous used/discard card is an attack, duplicate its effect and produce additional damage";
  kind = CardCategory.NormalCard;
  constructor() {}
  effect(input: EffectArguments): CardEffect {
    if (input.from.cards.discardPile.length === 0) {
      throw new Error(
        "FollowUpAttack: There is no card on the top of discard pile"
      );
    }
    // console.log(JSON.stringify(input.from.cards.discardPile));
    let eff = input.from.cards.discardPile[
      input.from.cards.discardPile.length - 1
    ].effect(input);
    // @ts-ignore
    eff.health -= 1; // Follow up attack produce 1 more attack point on top of the previous attack.
    return eff;
  }
}

export class QiAttack implements Card {
  name = QiAttack.name
  kind = CardCategory.NormalCard
  effect(input: EffectArguments): CardEffect {
    return {
      by: this,
      health: -5,
      healthLimit: -3
    }
  }
}

///////////////////
// Healing Cards //
///////////////////
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

/////////////////////////
// Special Effect Card //
/////////////////////////
export class QiFlow implements Card {
  kind = CardCategory.NormalCard
  name = QiFlow.name
  effect(input: EffectArguments): CardEffect {
    if(input.from !== input.to) {
      throw new Error('QiFlow can only be played against self');
    }
    console.log(input.from.cards.drawPile);
    const newHandCard = input.from.cards.hand.concat(
      input.from.cards.drawPile.last()
    )
    return {
      by: this,
      handCard: newHandCard,
      drawPile: input.from.cards.drawPile.slice(0, -1)
    }
  }
}



//////////////////////
// Equippment Cards //
//////////////////////
export class Health extends EquippmentCard {
  name = Health.name;
  constructor(public health: number) {
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
