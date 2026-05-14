export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeAngle(angle) {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function wrapValue(value, max) {
  if (value < 0) return value + max;
  if (value >= max) return value - max;
  return value;
}

export function wrapPosition(pos, width, height) {
  pos.x = wrapValue(pos.x, width);
  pos.y = wrapValue(pos.y, height);
}

export function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
