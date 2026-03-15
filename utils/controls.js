const JX = 120, JY = 740, JR = 50, DZ = 10;
const TX = 310, TY = 740;

export function setupControls(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  const touch = { x: 0, y: 0, left: false, right: false, up: false, down: false };
  const state = { cursors, touch, mode: 'joystick', turboPressed: false };

  const savedMode = localStorage.getItem('controlMode');
  if (savedMode) state.mode = savedMode;

  createTouchUI(scene, state);
  return state;
}

function createTouchUI(scene, state) {
  const gfx = scene.add.graphics().setDepth(200).setScrollFactor(0);

  // Toggle button
  const togBg = scene.add.rectangle(360, 690, 50, 24, 0x333333, 0.7)
    .setDepth(200).setScrollFactor(0).setInteractive({ useHandCursor: true });
  const togTxt = scene.add.text(360, 690, state.mode === 'joystick' ? 'JOY' : 'PAD', {
    font: 'bold 10px Arial', color: '#ffffff'
  }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

  togBg.on('pointerdown', () => {
    state.mode = state.mode === 'joystick' ? 'dpad' : 'joystick';
    togTxt.setText(state.mode === 'joystick' ? 'JOY' : 'PAD');
    localStorage.setItem('controlMode', state.mode);
  });

  // Turbo button
  state._turboBg = scene.add.circle(TX, TY, 25, 0x555555, 0.7)
    .setDepth(200).setScrollFactor(0).setInteractive({ useHandCursor: true });
  state._turboText = scene.add.text(TX, TY, 'T', {
    font: 'bold 16px Arial', color: '#999999'
  }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

  state._turboBg.on('pointerdown', () => { state.turboPressed = true; });
  state._turboBg.on('pointerup', () => { state.turboPressed = false; });

  // Pointer tracking
  let activePtr = null;

  scene.input.on('pointerdown', (p) => {
    if (p.x > 240) return;
    activePtr = p;
    applyPointer(p, state);
  });
  scene.input.on('pointermove', (p) => {
    if (p === activePtr) applyPointer(p, state);
  });
  scene.input.on('pointerup', (p) => {
    if (p !== activePtr) return;
    activePtr = null;
    state.touch.x = state.touch.y = 0;
    state.touch.left = state.touch.right = state.touch.up = state.touch.down = false;
  });

  scene.events.on('update', () => drawUI(gfx, state));
  scene.events.on('shutdown', () => {
    [gfx, togBg, togTxt, state._turboBg, state._turboText].forEach(o => o.destroy());
    if (state._turboPulse) { state._turboPulse.stop(); state._turboPulse = null; }
    activePtr = null;
  });
}

function applyPointer(p, state) {
  const dx = p.x - JX, dy = p.y - JY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (state.mode === 'joystick') {
    if (dist < DZ) { state.touch.x = state.touch.y = 0; return; }
    const f = Math.min(dist, JR) / JR;
    state.touch.x = (dx / dist) * f;
    state.touch.y = (dy / dist) * f;
  } else {
    state.touch.left = state.touch.right = state.touch.up = state.touch.down = false;
    if (dist <= DZ) return;
    const a = Math.atan2(dy, dx);
    if (a > -0.785 && a <= 0.785) state.touch.right = true;
    else if (a > 0.785 && a <= 2.356) state.touch.down = true;
    else if (a > -2.356 && a <= -0.785) state.touch.up = true;
    else state.touch.left = true;
  }
}

function drawUI(gfx, state) {
  gfx.clear();
  gfx.lineStyle(2, 0xffffff, 0.3);
  gfx.strokeCircle(JX, JY, JR);

  if (state.mode === 'joystick') {
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillCircle(JX + state.touch.x * JR, JY + state.touch.y * JR, 15);
  } else {
    for (const [dx, dy, active] of [
      [0, -1, state.touch.up], [0, 1, state.touch.down],
      [-1, 0, state.touch.left], [1, 0, state.touch.right]
    ]) {
      gfx.fillStyle(active ? 0x32CD32 : 0xffffff, active ? 0.7 : 0.3);
      gfx.fillCircle(JX + dx * 30, JY + dy * 30, 12);
    }
  }
}

export function updateTurboButton(state, chargePercent, scene) {
  if (!state._turboBg) return;
  const ready = chargePercent >= 100;
  state._turboBg.fillColor = ready ? 0xFFFF00 : 0x555555;
  state._turboText.setColor(ready ? '#000000' : '#999999');

  if (ready && !state._turboPulse && scene) {
    state._turboPulse = scene.tweens.add({
      targets: state._turboBg, alpha: 0.5,
      duration: 500, yoyo: true, repeat: -1
    });
  } else if (!ready && state._turboPulse) {
    state._turboPulse.stop();
    state._turboPulse = null;
    if (state._turboBg.active) state._turboBg.setAlpha(0.7);
  }
}
