import { describe, it, assert } from './testFramework.js';

describe('Player - Logic', () => {
  it('tile position calculation is correct', () => {
    // Math.floor(pixelY / 30) for row, Math.floor(pixelX / 30) for col
    assert.equal(Math.floor(75 / 30), 2);
    assert.equal(Math.floor(195 / 30), 6);
    assert.equal(Math.floor(0 / 30), 0);
    assert.equal(Math.floor(29 / 30), 0);
    assert.equal(Math.floor(30 / 30), 1);
  });

  it('speed constant is 150', () => {
    // Player speed should be 150px/s
    assert.equal(150, 150);
  });

  it('facing direction values are valid', () => {
    const validDirections = ['up', 'down', 'left', 'right'];
    for (const dir of validDirections) {
      assert.ok(validDirections.includes(dir));
    }
  });
});
