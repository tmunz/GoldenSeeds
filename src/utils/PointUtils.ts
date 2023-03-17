import { BoundingBox } from '../datatypes/BoundingBox';
import { Point } from '../datatypes/Point';

export class PointUtils {
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
        min: [Point.X, Point.Y].map((d) =>
          Math.min(agg.min[d], boundingBox.min[d]),
        ),
        max: [Point.X, Point.Y].map((d) =>
          Math.max(agg.max[d], boundingBox.max[d]),
        ),
      }),
      PointUtils.DEFAULT_BOUNDING_BOX,
    );
  }

  static distance(a: Point, b: Point): number {
    return Math.sqrt(
      (b[Point.X] - a[Point.X]) ** 2 + (b[Point.Y] - a[Point.Y]) ** 2,
    );
  }
}
