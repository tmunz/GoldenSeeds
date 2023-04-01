import { Edge } from './Edge';
import { Site } from './Site';
import { Point } from '../../../../datatypes/Point';

export class HalfEdge {
  site: Site;
  edge: Edge;
  angle: number; // radians

  constructor(edge: Edge, leftSite: Site, rightSite?: Site) {
    this.site = leftSite;
    this.edge = edge;
    this.angle =
      leftSite && rightSite
        ? Math.atan2(
          rightSite.point[Point.Y] - leftSite.point[Point.Y],
          rightSite.point[Point.X] - leftSite.point[Point.X],
        )
        : Math.atan2(
          this.getEndpoint()[Point.X] - this.getStartpoint()[Point.X],
            this.getEndpoint()[Point.Y] - this.getStartpoint()[Point.Y],
          );
  }

  getStartpoint(): Point {
    return this.site === this.edge.leftSite ? this.edge.getStartPoint() : this.edge.getEndPoint();
  }

  getEndpoint(): Point {
    return this.site === this.edge.leftSite ? this.edge.getEndPoint() : this.edge.getStartPoint();
  }
}
