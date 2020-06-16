import { MainCharactor } from './unit';
import { Card } from './interfaces';
import { Deque } from './math';
import * as card from './card';
import * as assert from 'assert';


describe('Bug Hunt', () => {
  it('has cards in the draw pile at the beginning', () => {

    const deck = new Deque<Card>(
      new card.Attack1(),
      new card.Attack1(),
      new card.QiFlow()
    )
    const mainC = new MainCharactor(
      "主角",
      {
        drawPile: deck,
        equipped: new Deque(new card.Health(100)),
      },
      {
        // @ts-ignore
        actions: undefined,
      }
    );
    assert.equal(mainC.getDrawPile().length, deck.length)
    
    mainC.draw(2);
    assert.equal(mainC.getHand().length, 2)
    assert.equal(mainC.getDrawPile().length, deck.length - 2)

    mainC.use(deck[1], mainC)
    assert.equal(mainC.getHand().length, 1)
    assert.equal(mainC.getDrawPile().length, 1)
    assert.equal(mainC.getDiscardPile().length, 1)
    assert.equal(mainC.getHealth(), 99)

    mainC.use(deck[2], mainC)
    assert.equal(mainC.getHand().length, 1)
    assert.equal(mainC.getHand()[0], deck[0])
    assert.equal(mainC.getDrawPile().length, 0)
    assert.equal(mainC.getDiscardPile().length, 2)
  })
});
