// Keep a visible size increase through 10 cm, with room for the farthest corners.
export function fitDistanceForExtent(extent, aspectRatio) {
  return Math.max(12, (extent * 2.7 + 4.5) * Math.max(1, 1 / aspectRatio));
}
