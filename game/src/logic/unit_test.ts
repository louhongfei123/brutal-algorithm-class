import { MainCharactor } from './unit';
import { Card } from './interfaces';
import { Deque } from './math';
import * as card from './card';
import * as assert from 'assert';


describe('Bug Hunt', () => {
  it('has cards in the draw pile at the beginning', () => {

    const drawPile = new Deque<Card>(
      new card.Attack1(),
      new card.Attack1(),
      new card.QiFlow()
    )
    const mainC = new MainCharactor(
      "主角",
      {
        drawPile: drawPile,
        equipped: new Deque(new card.Health(100)),
      },
      {
        // @ts-ignore
        actions: undefined,
      }
    );
    assert.equal(mainC.getDrawPile().length, drawPile.length)

    const effect = drawPile[2].effect({from: mainC, to: mainC})
    if(effect instanceof Error) {
      throw new Error();
    }
    if(effect.to) {
      mainC.cardEffects.push(effect.to);
    }
    if(effect.from) {
      mainC.cardEffects.push(effect.from);
    }
    assert.equal(mainC.getHand().length, 2)

  })
});
