import { BoundingBox } from "../datatypes/BoundingBox";

export class PointUtils {

  static DEFAULT_BOUNDING_BOX: BoundingBox = { min: [-0.0005, -0.0005], max: [0.0005, 0.0005] };

  static boundingBox(points: number[][]): BoundingBox {
    return points.reduce(
      (agg, point) => ({
        min: [0,1].map(d => Math.min(agg.min[d], point[d])),
        max: [0,1].map(d => Math.max(agg.max[d], point[d])),
      }),
      PointUtils.DEFAULT_BOUNDING_BOX,
    );
  }

  static combineBoundingBoxes(boundingBoxes: BoundingBox[]): BoundingBox {
    return boundingBoxes.reduce(
      (agg, boundingBox) => ({
        min: [0,1].map(d => Math.min(agg.min[d], boundingBox.min[d])),
        max: [0,1].map(d => Math.max(agg.max[d], boundingBox.max[d])),
      }),
      PointUtils.DEFAULT_BOUNDING_BOX,
    );
  }

}