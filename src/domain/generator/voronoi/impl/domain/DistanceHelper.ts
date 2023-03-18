export class DistanceHelper {
  static tolerance = 1e-9;

  static isEqualWithTolerance(a: number, b: number): boolean {
    return isFinite(a) && isFinite(b) && Math.abs(a - b) < DistanceHelper.tolerance;
  }

  static isSamePosition(...points: { x: number; y: number }[]): boolean {
    return points.length >= 2
      ? points.every(
          (p) =>
            p &&
            points[0] &&
            DistanceHelper.isEqualWithTolerance(p.x, points[0].x) &&
            DistanceHelper.isEqualWithTolerance(p.y, points[0].y),
        )
      : false;
  }
}
