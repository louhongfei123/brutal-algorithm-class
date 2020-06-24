import { MainCharactor } from "./unit_player";
import { Card, EquippmentCard } from "./interfaces";
import { Deque } from "./math";
import * as card from "./card";
import * as assert from "assert";
import * as units from "../units";


describe("Bug Hunt", () => {
  it("has cards in the draw pile at the beginning", () => {
    const deck = new Deque<Card>(
      new card.Attack(1),
      new card.Attack(1),
      new card.QiFlow(),
    );
    const mainC = new MainCharactor(
      "主角",
      {
        deck: deck,
        equipped: new Deque<EquippmentCard>(
          new card.Health(100),
          new card.Agility(100),
        ),
      },
      {
        // @ts-ignore
        actions: undefined,
      },
    );
    const enermy = units.SchoolBully();

    assert.equal(mainC.getDrawPile().length, deck.length);

    mainC.draw(2);
    assert.equal(mainC.getHand().length, 2);
    assert.equal(mainC.getDrawPile().length, deck.length - 2);

    mainC.use(deck[1], enermy);
    assert.equal(mainC.getHand().length, 1);
    assert.equal(mainC.getDrawPile().length, 1);
    assert.equal(mainC.getDiscardPile().length, 1);
    assert.equal(enermy.getHealth(), 9);

    mainC.use(deck[2], mainC);
    assert.equal(mainC.getHand().length, 1);
    assert.equal(mainC.getHand()[0], deck[0]);
    assert.equal(mainC.getDrawPile().length, 0);
    assert.equal(mainC.getDiscardPile().length, 2);
  });

  it("test 2", () => {
    const deck = new Deque<Card>(
      new card.Attack(1),
      new card.Attack(1),
      new card.QiFlow(),
    );
    const mainC = new MainCharactor(
      "主角",
      {
        deck: deck,
        equipped: new Deque(new card.Health(100)),
      },
      {
        // @ts-ignore
        actions: undefined,
      },
    );
    const enermy = units.SchoolBully();

    mainC.draw(2);
    mainC.use(deck[2], mainC);

    enermy.draw(2);
    enermy.use(enermy.getDeck()[1], mainC);

    mainC.shuffle();
    mainC.draw(2);

    assert.equal(mainC.getHand().length, 3);
    assert.equal(mainC.getDrawPile().length, 0);
    assert.equal(mainC.getDiscardPile().length, 0);
  });
});
