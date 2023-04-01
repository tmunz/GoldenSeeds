import { Site } from './Site';
import { HalfEdge } from './HalfEdge';
import { Boundary } from './Boundary';
import { Edge } from './Edge';
import { Point } from '../../../../datatypes/Point';
import { PointUtils } from '../../../../utils/PointUtils';

export class SiteArea {
  site: Site;
  halfEdges: HalfEdge[];
  canBeClosed: boolean;

  constructor(site: Site) {
    this.site = site;
    this.halfEdges = [];
    this.canBeClosed = false;
  }

  close(createBorderEdge: (site: Site, vertexA: Point, vertexB: Point) => Edge, boundary: Boundary) {
    const halfEdges = this.halfEdges
      .filter((halfEdge) => halfEdge.edge.isConnected())
      .sort((a, b: HalfEdge) => b.angle - a.angle);

    if (halfEdges.length > 0 && this.canBeClosed) {
      const danglingStart = halfEdges.find((halfEdge) => boundary.isPointOnBorder(halfEdge.getStartpoint()));
      const danglingEnd = halfEdges.find((halfEdge) => boundary.isPointOnBorder(halfEdge.getEndpoint()));
      if (danglingStart && danglingEnd) {
        if (
          [Point.X, Point.Y].some((d) =>
            PointUtils.isEqualWithTolerance(danglingStart.getStartpoint()[d], danglingEnd.getEndpoint()[d]),
          )
        ) {
          const edge: Edge = createBorderEdge(this.site, danglingStart.getStartpoint(), danglingEnd.getEndpoint());
          halfEdges.push(new HalfEdge(edge, this.site));
        } else {
          const slopeAngle = PointUtils.slopeAngle(danglingStart.getStartpoint(), danglingEnd.getEndpoint());
          let cornerPoint: Point;
          if (slopeAngle < Math.PI / 2) {
            cornerPoint = [boundary.max[Point.X], boundary.min[Point.Y]];
          } else if (slopeAngle < Math.PI) {
            cornerPoint = [boundary.max[Point.X], boundary.max[Point.Y]];
          } else if (slopeAngle < (Math.PI * 3) / 2) {
            cornerPoint = [boundary.min[Point.X], boundary.max[Point.Y]];
          } else {
            cornerPoint = [boundary.min[Point.X], boundary.min[Point.Y]];
          }
          const edgeA: Edge = createBorderEdge(this.site, danglingStart.getStartpoint(), cornerPoint);
          const edgeB: Edge = createBorderEdge(this.site, cornerPoint, danglingEnd.getEndpoint());
          halfEdges.push(new HalfEdge(edgeA, this.site), new HalfEdge(edgeB, this.site));
        }
      }
    }

    this.halfEdges = halfEdges;
    this.canBeClosed = false;
  }
}
