import { DistanceHelper } from './DistanceHelper';
import { VertexFactory } from './VertexFactory';
import { Site } from './Site';
import { Vertex } from './Vertex';
import { Boundary } from '../index';
import { SiteAreaStore } from './SiteAreaStore';

export class Edge {
  leftSite: Site;
  rightSite: Site;
  private vertices: Vertex[];

  constructor(leftSite: Site, rightSite: Site, ...vertices: Vertex[]) {
    this.leftSite = leftSite;
    this.rightSite = rightSite;
    this.vertices = vertices;
  }

  getStartPoint(): Vertex {
    return this.vertices[0];
  }

  getEndPoint(): Vertex {
    return this.vertices[1];
  }

  resetVertices(): void {
    this.vertices = [];
  }

  hasMinLength(): boolean {
    return !DistanceHelper.isSamePosition(...this.vertices);
  }

  isConnected(): boolean {
    return this.vertices.length === 2;
  }

  createStartpoint(vertex: Vertex, leftSite: Site, rightSite: Site): void {
    this.addVertex(vertex, leftSite, rightSite);
  }

  createEndpoint(vertex: Vertex, leftSite: Site, rightSite: Site): void {
    this.addVertex(vertex, rightSite, leftSite);
  }

  connectWith(boundary: Boundary, vertexFactory: VertexFactory, siteAreaStore: SiteAreaStore): boolean {
    if (this.getEndPoint()) {
      return true;
    }

    const center: { x: number; y: number } = {
      x: (this.leftSite.x + this.rightSite.x) / 2,
      y: (this.leftSite.y + this.rightSite.y) / 2,
    };
    let slope: number;
    let fb: number;

    siteAreaStore.get(this.leftSite.id).canBeClosed = true;
    siteAreaStore.get(this.rightSite.id).canBeClosed = true;

    if (!DistanceHelper.isEqualWithTolerance(this.leftSite.y, this.rightSite.y)) {
      slope = (this.leftSite.x - this.rightSite.x) / (-this.leftSite.y + this.rightSite.y);
      fb = center.y - slope * center.x;
    }

    const slopeIsVertical = slope === undefined;

    if (slopeIsVertical) {
      if (!boundary.isPointInside(center)) {
        return false;
      }
      if (this.leftSite.x < this.rightSite.x) {
        this.calculateUpward(center, boundary, vertexFactory);
      } else {
        this.calculateDownward(center, boundary, vertexFactory);
      }
    }

    // closer to vertical than horizontal, connect start point to the
    // top or bottom side of the bounding box
    else if (slope < -1 || 1 < slope) {
      // downward
      if (this.leftSite.x > this.rightSite.x) {
        if (!this.vertices[0] || this.vertices[0].y < boundary.top()) {
          this.vertices[0] = vertexFactory.create((boundary.top() - fb) / slope, boundary.top());
        } else if (this.vertices[0].y >= boundary.bottom()) {
          return false;
        }
        this.vertices[1] = vertexFactory.create((boundary.bottom() - fb) / slope, boundary.bottom());
      }
      // upward
      else {
        if (!this.vertices[0] || this.vertices[0].y > boundary.bottom()) {
          this.vertices[0] = vertexFactory.create((boundary.bottom() - fb) / slope, boundary.bottom());
        } else if (this.vertices[0].y < boundary.top()) {
          return false;
        }
        this.vertices[1] = vertexFactory.create((boundary.top() - fb) / slope, boundary.top());
      }
    }

    // closer to horizontal than vertical, connect start point to the
    // left or right side of the bounding box
    else {
      // rightward
      if (this.leftSite.y < this.rightSite.y) {
        if (!this.vertices[0] || this.vertices[0].x < boundary.left()) {
          this.vertices[0] = vertexFactory.create(boundary.left(), slope * boundary.left() + fb);
        } else if (this.vertices[0].x >= boundary.right()) {
          return false;
        }
        this.vertices[1] = vertexFactory.create(boundary.right(), slope * boundary.right() + fb);
      }

      // leftward
      else {
        if (!this.vertices[0] || this.vertices[0].x > boundary.right()) {
          this.vertices[0] = vertexFactory.create(boundary.right(), slope * boundary.right() + fb);
        } else if (this.vertices[0].x < boundary.left()) {
          return false;
        }
        this.vertices[1] = vertexFactory.create(boundary.left(), slope * boundary.left() + fb);
      }
    }
    return true;
  }

  private calculateUpward(center: { x: number; y: number }, boundary: Boundary, vertexFactory: VertexFactory) {
    const boundaryA = boundary.bottom();
    const boundaryB = boundary.top();
    if (!this.getStartPoint() || this.getStartPoint().y > boundaryA) {
      this.vertices[0] = vertexFactory.create(center.x, boundaryA);
    } else if (this.vertices[0].y < boundaryB) {
      return false;
    }
    this.vertices[1] = vertexFactory.create(center.x, boundaryB);
  }

  private calculateDownward(center: { x: number; y: number }, boundary: Boundary, vertexFactory: VertexFactory) {
    const boundaryA = boundary.top();
    const boundaryB = boundary.bottom();
    if (!this.getStartPoint() || this.getStartPoint().y < boundaryA) {
      this.vertices[0] = vertexFactory.create(center.x, boundaryA);
    } else if (this.vertices[0].y >= boundaryB) {
      return false;
    }
    this.vertices[1] = vertexFactory.create(center.x, boundaryB);
  }

  clipTo(boundary: Boundary, vertexFactory: VertexFactory, siteAreaStore: SiteAreaStore): boolean {
    if (!this.vertices[0] || !this.vertices[1]) {
      return false;
    }

    const ax = this.vertices[0].x;
    const ay = this.vertices[0].y;
    const bx = this.vertices[1].x;
    const by = this.vertices[1].y;
    let t0 = 0;
    let t1 = 1;
    const dx = bx - ax;
    const dy = by - ay;

    // left
    let q = ax - boundary.left();
    if (dx === 0 && q < 0) {
      return false;
    }

    let r = -q / dx;
    if (dx < 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    } else if (dx > 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    }

    // right
    q = boundary.right() - ax;
    if (dx === 0 && q < 0) {
      return false;
    }
    r = q / dx;
    if (dx < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else if (dx > 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }

    // top
    q = ay - boundary.top();
    if (dy === 0 && q < 0) {
      return false;
    }
    r = -q / dy;
    if (dy < 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    } else if (dy > 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    }

    // bottom
    q = boundary.bottom() - ay;
    if (dy === 0 && q < 0) {
      return false;
    }
    r = q / dy;
    if (dy < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else if (dy > 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }

    // if we reach this point, Voronoi edge is within bbox

    // if t0 > 0, va needs to change
    // rhill 2011-06-03: we need to create a new vertex rather
    // than modifying the existing one, since the existing
    // one is likely shared with at least another edge
    if (t0 > 0) {
      this.vertices[0] = vertexFactory.create(ax + t0 * dx, ay + t0 * dy);
    }

    // if t1 < 1, vb needs to change
    // rhill 2011-06-03: we need to create a new vertex rather
    // than modifying the existing one, since the existing
    // one is likely shared with at least another edge
    if (t1 < 1) {
      this.vertices[1] = vertexFactory.create(ax + t1 * dx, ay + t1 * dy);
    }

    // va and/or vb were clipped, thus we will need to close
    // siteAreas which use this edge.
    if (t0 > 0 || t1 < 1) {
      siteAreaStore.get(this.leftSite.id).canBeClosed = true;
      siteAreaStore.get(this.rightSite.id).canBeClosed = true;
    }

    return true;
  }

  private addVertex(vertex: Vertex, siteA: Site, siteB: Site) {
    if (!this.hasVertex()) {
      this.vertices[0] = vertex;
      this.leftSite = siteA;
      this.rightSite = siteB;
    } else if (this.vertices[0]) {
      this.vertices[1] = vertex;
    } else {
      this.vertices[0] = vertex;
    }
  }

  private hasVertex() {
    return this.vertices[0] || this.vertices[1];
  }
}
