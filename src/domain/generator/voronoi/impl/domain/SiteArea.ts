import { Site } from './Site';
import { HalfEdge } from './HalfEdge';
import { Boundary } from './Boundary';
import { Edge } from './Edge';
import { Vertex } from './Vertex';

export class SiteArea {
  site: Site;
  halfEdges: HalfEdge[];
  canBeClosed: boolean;

  constructor(site: Site) {
    this.site = site;
    this.halfEdges = [];
    this.canBeClosed = false;
  }

  close(
    createBorderEdge: (site: Site, a: Vertex, b: Vertex) => Edge,
    boundary: Boundary,
  ) {
    const halfEdges = this.halfEdges
      .filter((halfEdge) => halfEdge.edge.isConnected())
      .sort((a, b: HalfEdge) => b.angle - a.angle);

    if (halfEdges.length > 0 && this.canBeClosed) {
      const danglingStart: HalfEdge = halfEdges.find((halfEdge) =>
        boundary.isPointOnBorder(halfEdge.getStartpoint()),
      );
      const danglingEnd: HalfEdge = halfEdges.find((halfEdge) =>
        boundary.isPointOnBorder(halfEdge.getEndpoint()),
      );

      const edge: Edge = createBorderEdge(
        this.site,
        danglingStart.getStartpoint(),
        danglingEnd.getEndpoint(),
      );
      const halfEdge = new HalfEdge(edge, this.site, null);
      halfEdges.push(halfEdge);
    }

    this.halfEdges = halfEdges;
    this.canBeClosed = false;
  }
}
