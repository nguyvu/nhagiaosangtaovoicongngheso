export function parseAnswer(input) {
  const normalized = String(input).trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function isCorrectAnswer(input, expected, tolerance = 0.001) {
  const value = parseAnswer(input);
  return value !== null && Math.abs(value - expected) <= tolerance;
}
