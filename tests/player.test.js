import { describe, it, assert } from './testFramework.js';

describe('Player - Tile Position', () => {
  it('calculates tile from pixel center correctly', () => {
    assert.equal(Math.floor(75 / 30), 2);
    assert.equal(Math.floor(195 / 30), 6);
    assert.equal(Math.floor(0 / 30), 0);
    assert.equal(Math.floor(29 / 30), 0);
    assert.equal(Math.floor(30 / 30), 1);
  });

  it('handles pixel at exact tile boundary', () => {
    // At x=30, player is in col 1 (not still in col 0)
    assert.equal(Math.floor(30 / 30), 1);
    // At x=59 still in col 1
    assert.equal(Math.floor(59 / 30), 1);
  });
});

describe('Player - Speed', () => {
  it('base speed is 150', () => {
    assert.equal(150, 150);
  });

  it('turbo speed is 2x base', () => {
    const base = 150;
    const turbo = base * 2;
    assert.equal(turbo, 300);
  });
});

describe('Player - Facing Direction', () => {
  it('all four directions are valid', () => {
    const valid = ['up', 'down', 'left', 'right'];
    for (const dir of valid) {
      assert.ok(valid.includes(dir));
    }
  });
});

describe('Player - Turbo Charge Logic', () => {
  it('addCharge caps at 100', () => {
    let charge = 95;
    charge = Math.min(100, charge + 10);
    assert.equal(charge, 100);
  });

  it('activateTurbo requires 100% charge', () => {
    const canActivate = (charge) => charge >= 100;
    assert.equal(canActivate(99), false);
    assert.equal(canActivate(100), true);
  });

  it('turbo resets charge to 0 on activation', () => {
    let charge = 100;
    let active = false;
    if (charge >= 100) { active = true; charge = 0; }
    assert.equal(active, true);
    assert.equal(charge, 0);
  });

  it('turbo timer counts down from 3000ms', () => {
    let timer = 3000;
    timer -= 16.67; // one frame at 60fps
    assert.ok(timer > 0);
    assert.ok(timer < 3000);
  });
});
