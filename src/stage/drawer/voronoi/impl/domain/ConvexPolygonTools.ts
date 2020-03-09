import { Math2d } from '../math/Math2d';

export class ConvexPolygonTools {

  static offsetPath(path: Point[], offset = 0): Point[] {
    const isCounterclockwise = ConvexPolygonTools.isCounterclockwise(path);
    const counterclockwisePath = isCounterclockwise ? path : [...path].reverse();

    const rawOffsets = ConvexPolygonTools.calculateRawOffsets(counterclockwisePath, offset);
    const cleanedPath: Point[] = [];

    rawOffsets.forEach((curr, i, arr) => {

      const prev = arr[(i - 1 + arr.length) % arr.length];

      const originalDistance = Math2d.distanceBetween(prev.originalPoint, curr.originalPoint);
      const currOverlapsWithPrev = originalDistance + offset < curr.baseDistance + prev.baseDistance;
      let cleanedPoint = curr.offsetPoint;

      if (currOverlapsWithPrev) {
        cleanedPath.pop();
        const sideA = Math2d.distanceBetween(curr.offsetPoint, prev.offsetPoint);
        const gamma = Math.PI - 2 * prev.bisectorAngle;
        const beta = Math.PI - 2 * curr.bisectorAngle;
        const alpha = Math.PI - beta - gamma;
        const newPointDistanceFromPrevOffsetPoint = Math2d.triangleSideB(sideA, alpha, beta);
        cleanedPoint = Math2d.calculatePointWithAngleAndDistance(prev.offsetPoint, curr.offsetPoint, -gamma, newPointDistanceFromPrevOffsetPoint);
      }
      cleanedPath.push(cleanedPoint);
    });

    return isCounterclockwise ? cleanedPath : [...cleanedPath].reverse();
  }

  static isCounterclockwise(path: Point[]) {
    const angleSum = ConvexPolygonTools.signedArea(path);
    return 0 <= angleSum;
  }

  static signedArea(path: Point[]) {
    let signedArea = 0;
    path.forEach((curr, i, arr) => {
      const next = arr[(i + 1) % arr.length];
      signedArea += (curr.x * next.y - next.x * curr.y);
    });
    return signedArea / 2;
  }

  private static calculateRawOffsets(path: Point[], offset = 0): {
    originalPoint: Point; offsetPoint: Point; baseDistance: number; bisectorAngle: number;
  }[] {
    return path.map((point, i, arr) => {
      const prev = arr[(i - 1 + arr.length) % arr.length];
      const next = arr[(i + 1) % arr.length];
      const bisectorAngle = Math2d.angleAt(point, prev, next) / 2;
      const baseDistance = Math2d.triangleSideB(offset, bisectorAngle, Math.PI / 2);
      const offsetPoint: Point = Math2d.calculatePointWithAngleAndDistance(point, next, bisectorAngle, baseDistance);
      return { originalPoint: point, offsetPoint, baseDistance, bisectorAngle };
    });
  }
}
