import { Edge } from './Edge';
import { VertexFactory } from './VertexFactory';
import { AbstractMemoryFactory } from './utils/AbstractMemoryFactory';
import { Site } from './Site';
import { SiteAreaStore } from './SiteAreaStore';
import { Boundary } from './Boundary';
import { Point } from '../../../../datatypes/Point';

export class EdgeManager extends AbstractMemoryFactory<Edge> {
  private vertexFactory: VertexFactory;
  private siteAreaStore: SiteAreaStore;

  constructor(vertexFactory: VertexFactory, siteAreaStore: SiteAreaStore) {
    super();
    this.vertexFactory = vertexFactory;
    this.siteAreaStore = siteAreaStore;
  }

  create(leftSite: Site | null, rightSite: Site | null, va: Point, vb: Point): Edge {
    const edge: Edge = new Edge(leftSite, rightSite, va, vb);
    this.memorize(edge);
    return edge;
  }

  clean(boundary: Boundary): void {
    const cleanedEdges: Edge[] = [];

    this.createdObjects.forEach((edge) => {
      const couldConnectEdge = edge.connectWith(boundary, this.vertexFactory, this.siteAreaStore);
      const couldClipEdge = edge.clipTo(boundary, this.vertexFactory, this.siteAreaStore);
      if (couldConnectEdge && couldClipEdge && edge.hasMinLength()) {
        cleanedEdges.push(edge);
      } else {
        edge.resetVertices();
      }
    });

    this.createdObjects = cleanedEdges;
  }
}