import { BoundingBox } from '../datatypes/BoundingBox';
import { Point } from '../datatypes/Point';

export class PointUtils {
  static TOLERANCE = 1e-9;

  static DEFAULT_BOUNDING_BOX: BoundingBox = {
    min: [-0.0005, -0.0005],
    max: [0.0005, 0.0005],
  };

  static boundingBox(points: Point[]): BoundingBox {
    return points.reduce(
      (agg, point) => ({
        min: [Point.X, Point.Y].map((d) => Math.min(agg.min[d], point[d])),
        max: [Point.X, Point.Y].map((d) => Math.max(agg.max[d], point[d])),
      }),
      PointUtils.DEFAULT_BOUNDING_BOX,
    );
  }

  static combineBoundingBoxes(boundingBoxes: BoundingBox[]): BoundingBox {
    return boundingBoxes.reduce(
      (agg, boundingBox) => ({
        min: [Point.X, Point.Y].map((d) => Math.min(agg.min[d], boundingBox.min[d])),
        max: [Point.X, Point.Y].map((d) => Math.max(agg.max[d], boundingBox.max[d])),
      }),
      PointUtils.DEFAULT_BOUNDING_BOX,
    );
  }

  static distance(a: Point, b: Point): number {
    return Math.sqrt((b[Point.X] - a[Point.X]) ** 2 + (b[Point.Y] - a[Point.Y]) ** 2);
  }

  static isSamePoint(...points: Point[]): boolean {
    return 1 < points.length
      ? points.every(
        (p) =>
          PointUtils.isEqualWithTolerance(p[Point.X], points[0][Point.X]) &&
            PointUtils.isEqualWithTolerance(p[Point.Y], points[0][Point.Y]),
      )
      : true;
  }

  static isEqualWithTolerance(a: number, b: number): boolean {
    return isFinite(a) && isFinite(b) && Math.abs(a - b) < this.TOLERANCE;
  }

  static angleAt(hinge: Point, p0: Point, p1: Point): number {
    const a = PointUtils.distance(p1, p0);
    const b = PointUtils.distance(p1, hinge);
    const c = PointUtils.distance(hinge, p0);
    return Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)) / (2 * b * c));
  }

  static triangleSideB(a: number, alpha: number, beta: number): number {
    return (a * Math.sin(beta)) / Math.sin(alpha);
  }

  static triangleSideC(a: number, alpha: number, beta: number): number {
    const gamma = Math.PI - alpha - beta;
    return (a * Math.sin(gamma)) / Math.sin(alpha);
  }

  static slope(p0: Point, p1: Point): number {
    return (p1[Point.Y] - p0[Point.Y]) / (p1[Point.X] - p0[Point.X]);
  }

  static slopeAngle(p0: Point, p1: Point): number {
    const slope = PointUtils.slope(p0, p1);
    const angle = Math.atan(slope);
    if (p1[Point.X] < p0[Point.X]) {
      return Math.PI + angle;
    }
    return ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  }

  static calculatePointWithAngleAndDistance(a: Point, b: Point, rads: number, distanceAC: number): Point {
    const slopeAbRads = PointUtils.slopeAngle(a, b);
    return [
      Math.cos(rads + slopeAbRads) * distanceAC + a[Point.X],
      Math.sin(rads + slopeAbRads) * distanceAC + a[Point.Y],
    ];
  }
}
