import {
  Card,
  Unit,
  CardEffect,
  EquippmentCard,
  CardCategory,
  EffectArguments,
} from "./interfaces";
import { Deque, shuffle } from "./math";
import * as errors from "./errors";


//////////////////
// Attack Cards //
//////////////////
export class Attack implements Card {
  name: string;
  kind = CardCategory.AttackCard;
  constructor(public readonly damage: number) {
    this.name = `${Attack.name}${damage}`
  }
  effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | errors.InvalidBehavior {
    return {
      from: this.effectOnSource(input.from),
      to: this.effectOnTarget(input.to)
    };
  }

  effectOnSource(unit: Unit): CardEffect {
    return cardIsUsed(unit, this)
  }

  effectOnTarget(unit: Unit) {
    return {
      by: this,
      health: -this.damage,
    }
  }

}

export class FollowUpAttack implements Card {
  name = FollowUpAttack.name;
  desp =
    "If the previous used card is an attack, duplicate its effect and produce additional damage";
  kind = CardCategory.NormalCard;
  constructor() { }
  effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | errors.InvalidBehavior {
    const discardPile = input.from.getDiscardPile();
    if (discardPile.length === 0) {
      return new errors.InvalidBehavior("FollowUpAttack: There is no card on the top of discard pile");
    }
    const last = discardPile.last();
    if (!last) {
      throw new Error();
    }
    if (last.kind !== CardCategory.AttackCard) {
      return new errors.InvalidBehavior("FollowUpAttack: The previous used card is not an Attack Card")
    }
    if (last instanceof Attack) {
      let effectOnTarget = last.effectOnTarget(input.to);
      if (effectOnTarget instanceof errors.InvalidBehavior) {
        return effectOnTarget
      }
      // todo: check card type to be attack
      effectOnTarget.health -= 1;
      return {
        from: cardIsUsed(input.from, this),
        to: effectOnTarget
      };
    } else {
      throw new Error('unreachable');
    }

  }
}

// export class QiAttack implements Card {
//   name = QiAttack.name
//   kind = CardCategory.NormalCard
//   effect(input: EffectArguments): CardEffect {
//     return {
//       by: this,
//       health: -5,
//       healthLimit: -3
//     }
//   }
// }

///////////////////
// Healing Cards //
///////////////////
export class Heal implements Card {
  kind = CardCategory.NormalCard;
  name = Heal.name;
  constructor() { }
  effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | errors.InvalidBehavior {
    let health = 5;
    // console.log("getHealth", input.getHealth());
    // console.log("getHealthLimit", input.getHealthLimit());
    if (input.to.getHealth() + health > input.to.getHealthLimit()) {
      health = input.to.getHealthLimit() - input.to.getHealth();
    }
    // console.log("effect", health);
    return {
      from: cardIsUsed(input.from, this),
      to: {
        by: this,
        health: health
      }
    }
  }
}

// ////////////////////////
// // System Effect Card //
// ////////////////////////
export class Draw1 implements Card {
  kind = CardCategory.NormalCard
  name = Draw1.name

  effect(input: EffectArguments): { to: CardEffect } | errors.InvalidBehavior {
    const err = sameOrigin(input)
    if (err) {
      return err;
    }

    const drawPile = input.from.getDrawPile()
    console.log(drawPile);
    const last = drawPile.last();
    if (!last) {
      return new errors.InvalidBehavior('no card can be drawn');
    }
    const hand = input.from.getHand()
    const newHandCard = hand.concat(last)
    return {
      to: {
        by: this,
        handCard: new Deque(...newHandCard),
        drawPile: new Deque(...drawPile.slice(0, -1)),
        discardPile: input.to.getDiscardPile()
      }
    }
  }
}

export class Shuffle implements Card {
  kind = CardCategory.NormalCard
  name = Shuffle.name
  effect(input: EffectArguments): { to: CardEffect } | errors.InvalidBehavior {
    const err = sameOrigin(input)
    if (err) {
      return err;
    }

    const discard = input.to.getDiscardPile();
    const draw = input.to.getDrawPile();
    if (draw.length !== 0) {
      throw new Error();
    }
    shuffle(discard)
    return {
      to: {
        by: this,
        handCard: input.to.getHand(),
        drawPile: discard,
        discardPile: new Deque()
      }
    }
  }
}


// /////////////////////////
// // Special Effect Card //
// /////////////////////////
abstract class SelfCard {
  kind = CardCategory.NormalCard
  abstract effect(input: EffectArguments): { from: CardEffect } | errors.InvalidBehavior
}

export class QiFlow implements SelfCard {
  kind = CardCategory.NormalCard
  name = "真气加载"
  effect(input: EffectArguments): { from: CardEffect } | errors.InvalidBehavior {
    const err = sameOrigin(input)
    if (err) {
      return err;
    }
    const drawPile = input.from.getDrawPile()
    const last = drawPile.last();
    if (!last) {
      return new errors.InvalidBehavior('The is no card on draw pile');
    }
    const newFrom = cardIsUsed(input.to, this);
    return {
      from: {
        by: newFrom.by,
        handCard: new Deque(...newFrom.handCard.concat(last)),
        drawPile: new Deque(...drawPile.slice(0, -1)),
        discardPile: newFrom.discardPile
      }
    }
  }
}

function cardIsUsed(unit: Unit, card: Card) {
  const hand = unit.getHand();
  const discard = unit.getDiscardPile();
  const i = hand.indexOf(card);
  if (i === -1) {
    throw new Error('the card has to belong to the unit')
  }
  return {
    by: card,
    handCard: hand.remove(i),
    discardPile: new Deque(...discard.concat(card))
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
  effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | errors.InvalidBehavior {
    const err = sameOrigin(input)
    if (err) {
      return err;
    }
    return {
      from: {
        by: this
      },
      to: {
        by: this,
        health: this.health,
        healthLimit: this.health,
      }
    };
  }
}

export class Agility extends EquippmentCard {
  name = Agility.name;
  constructor(public agility: number) {
    super();
  }
  effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | errors.InvalidBehavior {
    const err = sameOrigin(input)
    if (err) {
      return err;
    }
    return {
      from: {
        by: this
      },
      to: {
        by: this,
        agility: this.agility,
      }
    };
  }
}

function sameOrigin(input: EffectArguments): errors.InvalidBehavior | undefined {
  if (input.from !== input.to) {
    return new errors.InvalidBehavior('not same origin');
  }
}
