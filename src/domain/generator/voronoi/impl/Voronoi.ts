import { Vertex as DomainVertex, Vertex } from './domain/Vertex';
import { Edge as DomainEdge } from './domain/Edge';
import { Boundary } from './domain/Boundary';
import { DistanceHelper } from './domain/DistanceHelper';
import { Queue } from './utils/Queue';
import { Cell } from './datatypes/Cell';
import { VoronoiWorker } from './domain/VoronoiWorker';
import { Edge } from './datatypes/Edge';
import { Site } from './domain/Site';
import { SiteArea } from './domain/SiteArea';
import { HalfEdge } from './domain/HalfEdge';
import { ConvexPolygonTools } from './domain/ConvexPolygonTools';

// this implementation uses the ideas of Fortune's algorithm
export class Voronoi {
  cells: Cell[] = [];
  edges: Edge[] = [];
  vertices: Point[] = [];

  constructor(inputPoints: number[][], boundary: Boundary, cellOffset = 0) {
    // console.log(inputPoints.length, boundary);
    // console.time("voronoi");

    const worker = new VoronoiWorker();
    const siteQueue: Queue<Site> = this.createSiteQueue(inputPoints);

    const {
      edges,
      vertices: domainVertices,
      siteAreas,
    } = worker.process(siteQueue, boundary);

    this.edges = edges.map((edge) => this.convertToEdge(edge));
    this.vertices = domainVertices
      .filter((p) => boundary.isPointInside(p))
      .map((p) => this.convertToPoint(p));
    this.cells = siteAreas.map((siteArea) => {
      const cell = this.convertToCell(siteArea);
      cell.path = ConvexPolygonTools.offsetPath(cell.path, cellOffset);
      return cell;
    });

    // console.timeEnd("voronoi");
    // console.log(this.cells, this.edges, this.vertices);
  }

  private createSiteQueue(points: number[][]): Queue<Site> {
    // this prevents breaking calculations, where javascript number presicion is not enough for input during some calculations
    const limitPrecision = (n: number) =>
      Math.floor(n / DistanceHelper.tolerance) * DistanceHelper.tolerance;

    const cleanedSites = points
      .sort((a, b) => (b[1] - a[1] ? b[1] - a[1] : b[0] - a[0]))
      .map((p, id) => ({
        id,
        x: limitPrecision(p[0]),
        y: limitPrecision(p[1]),
      }))
      .reduce(
        (arr, site) =>
          arr.find((s) => DistanceHelper.isSamePosition(s, site))
            ? arr
            : [...arr, site],
        [],
      );
    return new Queue(...cleanedSites.map((site, id) => ({ id, ...site })));
  }

  private convertToEdge(edge: DomainEdge): Edge {
    return {
      a: edge.getStartPoint(),
      b: edge.getEndPoint(),
    };
  }

  private convertToPoint(vertex: DomainVertex): Point {
    return {
      x: vertex.x,
      y: vertex.y,
    };
  }

  private convertToCell(siteArea: SiteArea): Cell {
    const center = { x: siteArea.site.x, y: siteArea.site.y };
    const path = this.createPath(siteArea.halfEdges);
    return { center, path };
  }

  private createPath(halfEdges: HalfEdge[]): Point[] {
    const queue: HalfEdge[] = [...halfEdges];
    const path: Point[] = [];

    if (queue.length > 0) {
      const point = queue.shift().getStartpoint();
      path.push({ x: point.x, y: point.y });
    }

    while (queue.length > 0) {
      let nextInPath: Point = this.retrieveStartpointAsNext(
        path[path.length - 1],
        queue,
      );
      if (!nextInPath) {
        nextInPath = this.retrieveEndpointAsNext(path[path.length - 1], queue);
      }
      path.push(nextInPath);
    }

    return path;
  }

  private retrieveStartpointAsNext(
    nextPointToFind: Vertex,
    queue: HalfEdge[],
  ): Point {
    return this.retrieveNextFormQueue(
      nextPointToFind,
      queue,
      (edge) => edge.getStartpoint(),
      (edge) => edge.getEndpoint(),
    );
  }

  private retrieveEndpointAsNext(
    nextPointToFind: Vertex,
    queue: HalfEdge[],
  ): Point {
    return this.retrieveNextFormQueue(
      nextPointToFind,
      queue,
      (edge) => edge.getEndpoint(),
      (edge) => edge.getStartpoint(),
    );
  }

  private retrieveNextFormQueue(
    nextPointToFind: Vertex,
    queue: HalfEdge[],
    findFun: (h: HalfEdge) => Vertex,
    setFun: (h: HalfEdge) => Vertex,
  ): Point {
    const nextIndex: number = queue.findIndex((edge) =>
      DistanceHelper.isSamePosition(nextPointToFind, findFun(edge)),
    );
    if (nextIndex >= 0) {
      return setFun(queue.splice(nextIndex, 1)[0]);
    }
  }
}
