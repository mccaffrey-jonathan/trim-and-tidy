export function setupControls(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  return { cursors, touch: { x: 0, y: 0, left: false, right: false, up: false, down: false } };
}
