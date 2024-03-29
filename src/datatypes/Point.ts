export type PointDimension = 0 | 1;

export class Point extends Array<number> {
  static X: PointDimension = 0;
  static Y: PointDimension = 1;

  toString() {
    return `${this[Point.X]},${this[Point.Y]}`;
  }
}
