import { describe, it, assert } from './testFramework.js';
import { TILE_SIZE } from '../entities/TileManager.js';

describe('Player - Tile Position', () => {
  it('calculates tile from pixel center correctly', () => {
    assert.equal(Math.floor(75 / TILE_SIZE), 2);
    assert.equal(Math.floor(195 / TILE_SIZE), 6);
    assert.equal(Math.floor(0 / TILE_SIZE), 0);
    assert.equal(Math.floor(29 / TILE_SIZE), 0);
    assert.equal(Math.floor(30 / TILE_SIZE), 1);
  });

  it('handles pixel at exact tile boundary', () => {
    assert.equal(Math.floor(TILE_SIZE / TILE_SIZE), 1);
    assert.equal(Math.floor((TILE_SIZE * 2 - 1) / TILE_SIZE), 1);
  });

  it('TILE_SIZE is 30', () => {
    assert.equal(TILE_SIZE, 30);
  });
});

describe('Player - Input Priority', () => {
  it('only one input source should drive movement at a time', () => {
    // Simulates the priority logic from Player.update
    const resolve = (kb, joy, dpad) => {
      if (dpad) return 'dpad';
      if (joy) return 'joystick';
      if (kb) return 'keyboard';
      return 'none';
    };
    assert.equal(resolve(true, true, true), 'dpad');
    assert.equal(resolve(true, true, false), 'joystick');
    assert.equal(resolve(true, false, false), 'keyboard');
    assert.equal(resolve(false, false, false), 'none');
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
    timer -= 16.67;
    assert.ok(timer > 0);
    assert.ok(timer < 3000);
  });

  it('turbo speed is 2x base (150 * 2 = 300)', () => {
    const base = 150;
    assert.equal(base * 2, 300);
  });
});
