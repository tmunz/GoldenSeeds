import { Boundary } from './Boundary';
import { Queue } from './utils/Queue';
import { Cell } from './Cell';
import { VoronoiWorker } from './VoronoiWorker';
import { Edge } from './Edge';
import { Site } from './Site';
import { SiteArea } from './SiteArea';
import { HalfEdge } from './HalfEdge';
import { ConvexPolygonTools } from './utils/ConvexPolygonTools';
import { Point } from '../../../../datatypes/Point';
import { PointUtils } from '../../../../utils/PointUtils';
import { BoundingBox } from '../../../../datatypes/BoundingBox';

// this implementation uses the ideas of Fortune's algorithm
export class Voronoi {
  cells: Cell[] = [];
  siteAreas: SiteArea[] = [];
  edges: Edge[] = [];
  vertices: Point[] = [];

  constructor(inputPoints: number[][], boundingBox: BoundingBox, cellOffset = 0) {
    const worker = new VoronoiWorker();
    const siteQueue: Queue<Site> = this.createSiteQueue(inputPoints);
    const boundary = new Boundary({
      min: [boundingBox.min[Point.X] - cellOffset, boundingBox.min[Point.Y] - cellOffset],
      max: [boundingBox.max[Point.X] + cellOffset, boundingBox.max[Point.Y] + cellOffset],
    });

    const { edges, vertices, siteAreas } = worker.process(siteQueue, boundary);

    this.edges = edges;
    this.vertices = vertices.filter((p) => boundary.isPointInside(p));
    this.siteAreas = siteAreas;
    this.cells = siteAreas.map((siteArea) => {
      const cell = this.convertToCell(siteArea);
      cell.path = ConvexPolygonTools.offsetPath(cell.path, cellOffset);
      return cell;
    });
  }

  private createSiteQueue(points: number[][]): Queue<Site> {
    const limitPrecision = (n: number) => Math.floor(n / PointUtils.TOLERANCE) * PointUtils.TOLERANCE;
    const cleanedSites = points
      .sort((a, b) => (b[1] - a[1] ? b[1] - a[1] : b[0] - a[0]))
      .map((p, id) => ({ point: [limitPrecision(p[0]), limitPrecision(p[1])], id }))
      .reduce(
        (arr, site) => (arr.find((s) => PointUtils.isSamePoint(s.point, site.point)) ? arr : [...arr, site]),
        [] as Site[],
      );
    return new Queue(...cleanedSites.map((site, id) => ({ id, ...site })));
  }

  private convertToCell(siteArea: SiteArea): Cell {
    const center = siteArea.site.point;
    const path = this.createPath(siteArea.halfEdges);
    return { center, path };
  }

  private createPath(halfEdges: HalfEdge[]): Point[] {
    const queue: HalfEdge[] = [...halfEdges];
    const path: Point[] = [];
    const first = queue.shift();
    if (first) {
      path.push(first.getStartpoint());
    }
    while (queue.length > 0) {
      const currentPathPoint = path[path.length - 1];
      const next = this.findNextInPathIndex(currentPathPoint, queue);
      if (next) {
        queue.splice(next.index, 1);
        path.push(next.point);
      } else {
        break;
      }
    }
    return path;
  }

  findNextInPathIndex(point: Point, edges: HalfEdge[]): { index: any; point: any } | undefined {
    for (let i = 0, edge; (edge = edges[i]); i++) {
      if (PointUtils.isSamePoint(point, edge.getEndpoint())) {
        return { index: i, point: edge.getStartpoint() };
      }
      if (PointUtils.isSamePoint(point, edge.getStartpoint())) {
        return { index: i, point: edge.getEndpoint() };
      }
    }
  }
}
