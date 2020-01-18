export class Math2d {

  static angleAt (hinge: Point, p0: Point, p1: Point): number {
    const a = Math2d.distanceBetween(p1, p0);
    const b = Math2d.distanceBetween(p1, hinge);
    const c = Math2d.distanceBetween(hinge, p0);
    return Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)) / (2 * b * c));
  }


  static distanceBetween (p0: Point, p1: Point): number {
    return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
  }


  static triangleSide (a: number, alpha: number, beta: number): number {
    return a * Math.sin(alpha) / Math.sin(beta);
  }

  static calculatePointWithAngleAndDistance (a: Point, b: Point, rads: number, offset: number): Point {
    const distance = Math2d.triangleSide(offset, rads, Math.PI / 2);
    const slopeAb: number = (b.x - a.x) / (b.y - a.y);
    const slopeAbRads = Math.atan(slopeAb);
    const x = Math.cos(rads) * distance + a.x
    const y = -Math.sin(rads) * distance + a.y
    console.log(a, b, slopeAb, slopeAbRads / Math.PI * 180, x, y);
    return { x, y }
  }

}