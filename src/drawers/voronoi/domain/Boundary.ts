import { DistanceHelper } from './DistanceHelper';


// needs to be convex
export class Boundary {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  isPointOnBorder(point: { x: number, y: number }): boolean {
    return DistanceHelper.isEqualWithTolerance(point.x, this.left())
      || DistanceHelper.isEqualWithTolerance(point.y, this.top())
      || DistanceHelper.isEqualWithTolerance(point.x, this.right())
      || DistanceHelper.isEqualWithTolerance(point.y, this.bottom())
  }

  isPointInside(point: { x: number, y: number }): boolean {
    return this.left() <= point.x && point.x <= this.right()
      && this.top() <= point.y && point.y <= this.bottom();
  }

  left(): number {
    return this.x;
  }

  right(): number {
    return this.x + this.width
  }

  top(): number {
    return this.y;
  }

  bottom(): number {
    return this.y + this.height;
  }

}
