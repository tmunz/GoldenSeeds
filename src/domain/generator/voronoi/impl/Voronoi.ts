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

// this implementation uses the ideas of Fortune's algorithm
export class Voronoi {
  cells: Cell[] = [];
  edges: Edge[] = [];
  vertices: Point[] = [];

  constructor(inputPoints: number[][], boundary: Boundary, cellOffset = 0) {
    const worker = new VoronoiWorker();
    const siteQueue: Queue<Site> = this.createSiteQueue(inputPoints);

    const { edges, vertices: domainVertices, siteAreas } = worker.process(siteQueue, boundary);

    this.edges = edges;
    this.vertices = domainVertices.filter((p) => boundary.isPointInside(p));
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
      .map((p, id) => ({
        id,
        x: limitPrecision(p[0]),
        y: limitPrecision(p[1]),
      }))
      .reduce((arr, site) => (arr.find((s) => PointUtils.isSamePoint([s.x, s.y], [site.x, site.y])) ? arr : [...arr, site]), [] as Site[]);
    return new Queue(...cleanedSites.map((site, id) => ({ id, ...site })));
  }

  private convertToCell(siteArea: SiteArea): Cell {
    const center = [siteArea.site.x, siteArea.site.y];
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
      }
    }
    return path;
  }

  findNextInPathIndex(point: Point, edges: HalfEdge[]): { index: any; point: any; } | undefined {
    for (let i = 0, edge; edge = edges[i]; i++) {
      if (PointUtils.isSamePoint(point, edge.getEndpoint())) {
        return { index: i, point: edge.getStartpoint() };
      }
      if (PointUtils.isSamePoint(point, edge.getStartpoint())) {
        return { index: i, point: edge.getEndpoint() };
      }
    }
  }
}
