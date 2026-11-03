/** Tangent at t=0.5 of the single cubic returned by React Flow's getBezierPath. */
export function connectionMidpointAngle(path: string): number {
  const coordinates = path.match(/[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi)?.map(Number);
  if (!coordinates || coordinates.length !== 8) { return 0; }
  const [x0, y0, x1, y1, x2, y2, x3, y3] = coordinates;
  // The derivative's common factor (0.75) does not affect its angle.
  const dx = -x0 - x1 + x2 + x3;
  const dy = -y0 - y1 + y2 + y3;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}
