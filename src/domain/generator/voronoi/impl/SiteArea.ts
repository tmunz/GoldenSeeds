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
      // Each gap must follow the perimeter in the same direction as the cell.
      // A single bisector can cross opposite sides and needs two boundary corners.
      const width = boundary.max[Point.X] - boundary.min[Point.X];
      const height = boundary.max[Point.Y] - boundary.min[Point.Y];
      const perimeter = 2 * (width + height);
      const corners: Point[] = [
        [boundary.min[Point.X], boundary.min[Point.Y]],
        [boundary.min[Point.X], boundary.max[Point.Y]],
        [boundary.max[Point.X], boundary.max[Point.Y]],
        [boundary.max[Point.X], boundary.min[Point.Y]],
      ];
      const cornerDistances = [0, height, height + width, 2 * height + width];
      const distanceAlongBorder = (point: Point): number => {
        if (PointUtils.isEqualWithTolerance(point[Point.X], boundary.min[Point.X])) { return point[Point.Y] - boundary.min[Point.Y]; }
        if (PointUtils.isEqualWithTolerance(point[Point.Y], boundary.max[Point.Y])) { return height + point[Point.X] - boundary.min[Point.X]; }
        if (PointUtils.isEqualWithTolerance(point[Point.X], boundary.max[Point.X])) { return height + width + boundary.max[Point.Y] - point[Point.Y]; }
        return 2 * height + width + boundary.max[Point.X] - point[Point.X];
      };
      const originalEdges = [...halfEdges];
      originalEdges.forEach((halfEdge, i) => {
        const start = halfEdge.getEndpoint();
        const end = originalEdges[(i + 1) % originalEdges.length].getStartpoint();
        if (PointUtils.isSamePoint(start, end) || !boundary.isPointOnBorder(start) || !boundary.isPointOnBorder(end)) { return; }
        const from = distanceAlongBorder(start);
        const distance = (distanceAlongBorder(end) - from + perimeter) % perimeter;
        const intermediate = corners.map((point, index) => ({
          point, distance: (cornerDistances[index] - from + perimeter) % perimeter,
        })).filter(corner => corner.distance > PointUtils.TOLERANCE && corner.distance < distance - PointUtils.TOLERANCE)
          .sort((a, b) => a.distance - b.distance);
        let previous = start;
        for (const point of [...intermediate.map(corner => corner.point), end]) {
          halfEdges.push(new HalfEdge(createBorderEdge(this.site, previous, point), this.site));
          previous = point;
        }
      });
    }

    this.halfEdges = halfEdges;
    this.canBeClosed = false;
  }
}
