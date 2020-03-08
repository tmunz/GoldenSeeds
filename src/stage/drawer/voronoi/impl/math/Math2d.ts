export class Math2d {

  static angleAt(hinge: Point, p0: Point, p1: Point): number {
    const a = Math2d.distanceBetween(p1, p0);
    const b = Math2d.distanceBetween(p1, hinge);
    const c = Math2d.distanceBetween(hinge, p0);
    return Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)) / (2 * b * c));
  }


  static distanceBetween(p0: Point, p1: Point): number {
    return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
  }


  static triangleSideB(a: number, alpha: number, beta: number): number {
    return a * Math.sin(beta) / Math.sin(alpha);
  }

  
  static triangleSideC(a: number, alpha: number, beta: number): number {
    const gamma = Math.PI - alpha - beta;
    return a * Math.sin(gamma) / Math.sin(alpha);
  }


  static slope(p0: Point, p1: Point): number {
    return (p1.y - p0.y) / (p1.x - p0.x);
  }


  static slopeAngle(p0: Point, p1: Point): number {
    const slope = Math2d.slope(p0, p1);
    const slopeAngleRaw = Math.atan(slope);
    if (p0.x <= p1.x && p0.y <= p1.y) {
      return slopeAngleRaw;
    } else if (p0.x > p1.x && p0.y <= p1.y) {
      return Math.PI + slopeAngleRaw;
    } else if (p0.x > p1.x && p0.y > p1.y) {
      return Math.PI + slopeAngleRaw;
    } else if (p0.x <= p1.x && p0.y > p1.y) {
      return 2 * Math.PI + slopeAngleRaw;
    }
  }


  static calculatePointWithAngleAndDistance(a: Point, b: Point, rads: number, distanceAC: number): Point {
    const slopeAbRads = Math2d.slopeAngle(a, b);
    const c = {
      x: Math.cos(rads + slopeAbRads) * distanceAC + a.x,
      y: Math.sin(rads + slopeAbRads) * distanceAC + a.y,
    }
    return c
  }

}