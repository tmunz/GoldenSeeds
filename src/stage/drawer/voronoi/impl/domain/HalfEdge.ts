import { Vertex } from './Vertex';
import { Edge } from './Edge';
import { Site } from './Site';

export class HalfEdge {
  site: Site;
  edge: Edge;
  angle: number; // radians

  constructor(edge: Edge, leftSite: Site, rightSite?: Site) {
    this.site = leftSite;
    this.edge = edge;
    this.angle = leftSite && rightSite
      ? Math.atan2(rightSite.y - leftSite.y, rightSite.x - leftSite.x)
      : Math.atan2(this.getEndpoint().x - this.getStartpoint().x, this.getEndpoint().y - this.getStartpoint().y);
  }

  getStartpoint(): Vertex {
    return this.site === this.edge.leftSite ? this.edge.getStartPoint() : this.edge.getEndPoint();
  };

  getEndpoint(): Vertex {
    return this.site === this.edge.leftSite ? this.edge.getEndPoint() : this.edge.getStartPoint();
  };

}
