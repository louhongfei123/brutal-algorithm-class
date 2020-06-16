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
export class Attack1 implements Card {
  name = Attack1.name;
  kind = CardCategory.NormalCard;
  constructor() { }
  effect(input: EffectArguments): { from: CardEffect, to: CardEffect } | errors.InvalidBehavior {
    return {
      from: cardIsUsed(input.to, this),
      to: {
        by: this,
        health: -1,
      }
    };
  }
}

// export class Attack2 implements Card {
//   name = Attack2.name;
//   kind = CardCategory.NormalCard;
//   constructor() { }
//   effect(input: EffectArguments): CardEffect | errors.InvalidBehavior {
//     return {
//       by: this,
//       health: -2,
//     };
//   }
// }

// export class Attack3 implements Card {
//   name = Attack3.name;
//   kind = CardCategory.NormalCard;
//   constructor() { }
//   effect(input: EffectArguments): CardEffect | errors.InvalidBehavior {
//     return {
//       by: this,
//       health: -3,
//     };
//   }
// }

// export class Attack4 implements Card {
//   name = Attack4.name;
//   kind = CardCategory.NormalCard;
//   constructor() { }
//   effect(input: EffectArguments): CardEffect | errors.InvalidBehavior {
//     return {
//       by: this,
//       health: -4,
//     };
//   }
// }

// export class Attack5 implements Card {
//   name = Attack5.name;
//   kind = CardCategory.NormalCard;
//   constructor() { }
//   effect(input: EffectArguments): CardEffect | errors.InvalidBehavior {
//     return {
//       by: this,
//       health: -5,
//     };
//   }
// }

// export class FollowUpAttack implements Card {
//   name = FollowUpAttack.name;
//   desp =
//     "If the previous used/discard card is an attack, duplicate its effect and produce additional damage";
//   kind = CardCategory.NormalCard;
//   constructor() { }
//   effect(input: EffectArguments): CardEffect | errors.InvalidBehavior {
//     if (input.from.getDiscardPile().length === 0) {
//       return new errors.InvalidBehavior("FollowUpAttack: There is no card on the top of discard pile");
//     }
//     let eff = input.from.getDiscardPile()[
//       input.from.getDiscardPile().length - 1
//     ].effect(input);
//     if (eff instanceof errors.InvalidBehavior) {
//       return eff;
//     }
//     if (!eff.health) {
//       throw new Error();
//     }
//     // todo: check card type to be attack
//     eff.health -= 1; // Follow up attack produce 1 more attack point on top of the previous attack.
//     return eff;
//   }
// }

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

// ///////////////////
// // Healing Cards //
// ///////////////////
// export class Heal implements Card {
//   kind = CardCategory.NormalCard;
//   name = Heal.name;
//   constructor() { }
//   effect(input: EffectArguments): CardEffect | errors.InvalidBehavior {
//     let health = 5;
//     // console.log("getHealth", input.getHealth());
//     // console.log("getHealthLimit", input.getHealthLimit());
//     if (input.to.getHealth() + health > input.to.getHealthLimit()) {
//       health = input.to.getHealthLimit() - input.to.getHealth();
//     }
//     // console.log("effect", health);
//     return {
//       by: this,
//       health: health,
//       handCard: input.to.get
//     };
//   }
// }

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
export class QiFlow implements Card {
  kind = CardCategory.NormalCard
  name = "真气加载"
  effect(input: EffectArguments): { from: CardEffect, to?: CardEffect } | errors.InvalidBehavior {
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
      from: newFrom,
      to: {
        by: this,
        handCard: new Deque(...newFrom.handCard.concat(last)),
        drawPile: new Deque(...drawPile.slice(0, -1))
      }
    }
  }
}

function cardIsUsed(unit: Unit, card: Card) {
  const hand = unit.getHand();
  const discard = unit.getDiscardPile();
  const i = hand.indexOf(card);
  console.log(hand, discard, hand.remove(i))
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

function sameOrigin(input: EffectArguments): errors.InvalidBehavior | undefined {
  if (input.from !== input.to) {
    return new errors.InvalidBehavior('not same origin');
  }
}
