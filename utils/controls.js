const JOYSTICK_X = 120;
const JOYSTICK_Y = 740;
const JOYSTICK_R = 50;
const DEADZONE = 10;
const DPAD_SIZE = 40;
const TURBO_X = 310;
const TURBO_Y = 740;

export function setupControls(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  const touch = { x: 0, y: 0, left: false, right: false, up: false, down: false };
  const state = { cursors, touch, mode: 'joystick', turboPressed: false };

  const savedMode = localStorage.getItem('controlMode');
  if (savedMode) state.mode = savedMode;

  // Only create touch UI if touch is available
  if (scene.sys.game.device.input.touch || true) {
    createTouchUI(scene, state);
  }

  return state;
}

function createTouchUI(scene, state) {
  const gfx = scene.add.graphics().setDepth(200).setScrollFactor(0);
  state._gfx = gfx;
  state._elements = [];

  // Toggle button
  const toggleBg = scene.add.rectangle(360, 690, 50, 24, 0x333333, 0.7)
    .setDepth(200).setScrollFactor(0).setInteractive({ useHandCursor: true });
  const toggleText = scene.add.text(360, 690, state.mode === 'joystick' ? 'JOY' : 'PAD', {
    font: 'bold 10px Arial', color: '#ffffff'
  }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

  toggleBg.on('pointerdown', () => {
    state.mode = state.mode === 'joystick' ? 'dpad' : 'joystick';
    toggleText.setText(state.mode === 'joystick' ? 'JOY' : 'PAD');
    localStorage.setItem('controlMode', state.mode);
  });

  // Turbo button
  const turboBg = scene.add.circle(TURBO_X, TURBO_Y, 25, 0x555555, 0.7)
    .setDepth(200).setScrollFactor(0).setInteractive({ useHandCursor: true });
  const turboText = scene.add.text(TURBO_X, TURBO_Y, 'T', {
    font: 'bold 16px Arial', color: '#999999'
  }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

  state._turboBg = turboBg;
  state._turboText = turboText;

  turboBg.on('pointerdown', () => { state.turboPressed = true; });
  turboBg.on('pointerup', () => { state.turboPressed = false; });

  // Joystick / D-pad input handling
  let activePointer = null;

  scene.input.on('pointerdown', (pointer) => {
    if (pointer.x / scene.scale.displayScale.x > 200) return; // right side reserved
    activePointer = pointer;
    handlePointerMove(pointer, state);
  });

  scene.input.on('pointermove', (pointer) => {
    if (pointer !== activePointer) return;
    handlePointerMove(pointer, state);
  });

  scene.input.on('pointerup', (pointer) => {
    if (pointer !== activePointer) return;
    activePointer = null;
    state.touch.x = 0;
    state.touch.y = 0;
    state.touch.left = state.touch.right = state.touch.up = state.touch.down = false;
  });

  // Draw controls each frame
  scene.events.on('update', () => {
    drawControls(gfx, state, activePointer);
  });
}

function handlePointerMove(pointer, state) {
  // Scale pointer to game coordinates
  const scale = pointer.camera ? 1 : 1;
  const dx = pointer.x - JOYSTICK_X;
  const dy = pointer.y - JOYSTICK_Y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (state.mode === 'joystick') {
    if (dist < DEADZONE) {
      state.touch.x = 0;
      state.touch.y = 0;
    } else {
      const clampedDist = Math.min(dist, JOYSTICK_R);
      state.touch.x = (dx / dist) * (clampedDist / JOYSTICK_R);
      state.touch.y = (dy / dist) * (clampedDist / JOYSTICK_R);
    }
  } else {
    // D-pad mode: determine direction from angle
    state.touch.left = state.touch.right = state.touch.up = state.touch.down = false;
    if (dist > DEADZONE) {
      const angle = Math.atan2(dy, dx);
      if (angle > -0.785 && angle <= 0.785) state.touch.right = true;
      else if (angle > 0.785 && angle <= 2.356) state.touch.down = true;
      else if (angle > -2.356 && angle <= -0.785) state.touch.up = true;
      else state.touch.left = true;
    }
  }
}

function drawControls(gfx, state, activePointer) {
  gfx.clear();
  gfx.lineStyle(2, 0xffffff, 0.3);
  gfx.strokeCircle(JOYSTICK_X, JOYSTICK_Y, JOYSTICK_R);

  if (state.mode === 'joystick') {
    // Draw thumb position
    const thumbX = JOYSTICK_X + state.touch.x * JOYSTICK_R;
    const thumbY = JOYSTICK_Y + state.touch.y * JOYSTICK_R;
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillCircle(thumbX, thumbY, 15);
  } else {
    // Draw D-pad arrows
    const dirs = [
      { x: 0, y: -1, active: state.touch.up },
      { x: 0, y: 1, active: state.touch.down },
      { x: -1, y: 0, active: state.touch.left },
      { x: 1, y: 0, active: state.touch.right }
    ];
    for (const d of dirs) {
      const cx = JOYSTICK_X + d.x * 30;
      const cy = JOYSTICK_Y + d.y * 30;
      gfx.fillStyle(d.active ? 0x32CD32 : 0xffffff, d.active ? 0.7 : 0.3);
      gfx.fillCircle(cx, cy, 12);
    }
  }
}

export function updateTurboButton(state, chargePercent) {
  if (!state._turboBg) return;
  const ready = chargePercent >= 100;
  state._turboBg.fillColor = ready ? 0xFFFF00 : 0x555555;
  state._turboText.setColor(ready ? '#000000' : '#999999');
}
