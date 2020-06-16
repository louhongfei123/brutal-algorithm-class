import { MainCharactor } from './unit';
import { Card } from './interfaces';
import { Deque } from './math';
import * as card from './card';
import * as assert from 'assert';

describe('Bug Hunt', () => {
  it('has cards in the draw pile at the beginning', () => {

    const drawPile = new Deque<Card>(
      new card.Attack1(),
      new card.Attack1()
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
  })
});
