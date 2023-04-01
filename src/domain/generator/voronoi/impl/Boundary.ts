import { Point } from '../../../../datatypes/Point';
import { BoundingBox } from '../../../../datatypes/BoundingBox';
import { PointUtils } from '../../../../utils/PointUtils';

export class Boundary implements BoundingBox {
  min: Point;
  max: Point;

  constructor(boundingBox: BoundingBox) {
    this.min = boundingBox.min;
    this.max = boundingBox.max;
  }

  isPointOnBorder(point: Point): boolean {
    return (
      PointUtils.isEqualWithTolerance(point[Point.X], this.min[Point.X]) ||
      PointUtils.isEqualWithTolerance(point[Point.X], this.max[Point.X]) ||
      PointUtils.isEqualWithTolerance(point[Point.Y], this.min[Point.Y]) ||
      PointUtils.isEqualWithTolerance(point[Point.Y], this.max[Point.Y])
    );
  }

  isPointInside(point: Point): boolean {
    return (
      this.min[Point.X] <= point[Point.X] &&
      point[Point.X] <= this.max[Point.X] &&
      this.min[Point.Y] <= point[Point.Y] &&
      point[Point.Y] <= this.max[Point.Y]
    );
  }
}
