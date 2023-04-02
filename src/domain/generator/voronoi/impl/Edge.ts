import { VertexFactory } from './VertexFactory';
import { Site } from './Site';
import { SiteAreaStore } from './SiteAreaStore';
import { Boundary } from './Boundary';
import { PointUtils } from '../../../../utils/PointUtils';
import { Point } from '../../../../datatypes/Point';

export class Edge {
  leftSite?: Site;
  rightSite?: Site;
  private vertices: Point[] = [];

  constructor(leftSite?: Site, rightSite?: Site, vertices: Point[] = []) {
    this.leftSite = leftSite;
    this.rightSite = rightSite;
    this.vertices = vertices;
  }

  getStartPoint(): Point | undefined {
    return this.vertices && 0 <= this.vertices.length ? this.vertices[0] : undefined;
  }

  getEndPoint(): Point | undefined {
    return this.vertices && 1 <= this.vertices.length ? this.vertices[1] : undefined;
  }

  resetVertices(): void {
    this.vertices = [];
  }

  hasMinLength(): boolean {
    return !PointUtils.isSamePoint(...(this.vertices ?? []));
  }

  isConnected(): boolean {
    return this.vertices !== undefined && this.vertices.length === 2;
  }

  createStartpoint(vertex: Point, leftSite: Site, rightSite: Site): void {
    this.addVertex(vertex, leftSite, rightSite);
  }

  createEndpoint(vertex: Point, leftSite: Site, rightSite: Site): void {
    this.addVertex(vertex, rightSite, leftSite);
  }

  connectToBoundry(boundary: Boundary, vertexFactory: VertexFactory, siteAreaStore: SiteAreaStore) {
    if (this.vertices[1] !== undefined) {
      return true;
    } else if (this.leftSite && this.rightSite) {
      const left = this.leftSite.point;
      const right = this.rightSite.point;
      const center = [(left[Point.X] + right[Point.X]) / 2, (left[Point.Y] + right[Point.Y]) / 2];
      const slope =
        right[Point.Y] !== left[Point.Y]
          ? (left[Point.X] - right[Point.X]) / (right[Point.Y] - left[Point.Y])
          : left[Point.X] < right[Point.X]
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY;
      const fb = center[Point.Y] - slope * center[Point.X];

      this.leftSite && (siteAreaStore.get(this.leftSite.id).canBeClosed = true);
      this.rightSite && (siteAreaStore.get(this.rightSite.id).canBeClosed = true);

      if (!isFinite(slope)) {
        if (center[Point.X] < boundary.min[Point.X] || center[Point.X] >= boundary.max[Point.X]) {
          return false;
        }
        // downward
        if (slope === Number.NEGATIVE_INFINITY) {
          if (this.vertices[0] === undefined || this.vertices[0][Point.Y] < boundary.min[Point.Y]) {
            this.vertices[0] = vertexFactory.create(center[Point.X], boundary.min[Point.Y]);
          } else if (this.vertices[0][Point.Y] >= boundary.max[Point.Y]) {
            return false;
          }
          this.vertices[1] = vertexFactory.create(center[Point.X], boundary.max[Point.Y]);
        }
        // upward
        else {
          if (this.vertices[0] === undefined || this.vertices[0][Point.Y] > boundary.max[Point.Y]) {
            this.vertices[0] = vertexFactory.create(center[Point.X], boundary.max[Point.Y]);
          } else if (this.vertices[0][Point.Y] < boundary.min[Point.Y]) {
            return false;
          }
          this.vertices[1] = vertexFactory.create(center[Point.X], boundary.min[Point.Y]);
        }
      } else if (-1 <= slope && slope <= 1) {
        // closer to horizontal than vertical, connect start point to the
        // left or right side of the bounding box
        // rightward
        if (left[Point.Y] < right[Point.Y]) {
          if (this.vertices[0] === undefined || this.vertices[0][Point.X] < boundary.min[Point.X]) {
            this.vertices[0] = vertexFactory.create(boundary.min[Point.X], slope * boundary.min[Point.X] + fb);
          } else if (this.vertices[0][Point.X] >= boundary.max[Point.X]) {
            return false;
          }
          this.vertices[1] = vertexFactory.create(boundary.max[Point.X], slope * boundary.max[Point.X] + fb);
        }
        // leftward
        else {
          if (this.vertices[0] === undefined || this.vertices[0][Point.X] > boundary.max[Point.X]) {
            this.vertices[0] = vertexFactory.create(boundary.max[Point.X], slope * boundary.max[Point.X] + fb);
          } else if (this.vertices[0][Point.X] < boundary.min[Point.X]) {
            return false;
          }
          this.vertices[1] = vertexFactory.create(boundary.min[Point.X], slope * boundary.min[Point.X] + fb);
        }
      } else {
        // closer to vertical than horizontal, connect start point to the
        // top or bottom side of the bounding box
        // downward
        if (left[Point.X] > right[Point.X]) {
          if (this.vertices[0] === undefined || this.vertices[0][Point.Y] < boundary.min[Point.Y]) {
            this.vertices[0] = vertexFactory.create((boundary.min[Point.Y] - fb) / slope, boundary.min[Point.Y]);
          } else if (this.vertices[0][Point.Y] >= boundary.max[Point.Y]) {
            return false;
          }
          this.vertices[1] = vertexFactory.create((boundary.max[Point.Y] - fb) / slope, boundary.max[Point.Y]);
        }
        // upward
        else {
          if (this.vertices[0] === undefined || this.vertices[0][Point.Y] > boundary.max[Point.Y]) {
            this.vertices[0] = vertexFactory.create((boundary.max[Point.Y] - fb) / slope, boundary.max[Point.Y]);
          } else if (this.vertices[0][Point.Y] < boundary.min[Point.Y]) {
            return false;
          }
          this.vertices[1] = vertexFactory.create((boundary.min[Point.Y] - fb) / slope, boundary.min[Point.Y]);
        }
      }
      return true;
    }
  }

  clipTo(boundary: Boundary, vertexFactory: VertexFactory, siteAreaStore: SiteAreaStore): boolean {
    if (!this.vertices[0] || !this.vertices[1]) {
      return false;
    }

    const ax = this.vertices[0][Point.X];
    const ay = this.vertices[0][Point.Y];
    const bx = this.vertices[1][Point.X];
    const by = this.vertices[1][Point.Y];
    let t0 = 0;
    let t1 = 1;
    const dx = bx - ax;
    const dy = by - ay;

    // left
    let q = ax - boundary.min[Point.X];
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
    q = boundary.max[Point.X] - ax;
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
    q = ay - boundary.min[Point.Y];
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
    q = boundary.max[Point.Y] - ay;
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

    if (t0 > 0) {
      this.vertices[0] = vertexFactory.create(ax + t0 * dx, ay + t0 * dy);
    }

    if (t1 < 1) {
      this.vertices[1] = vertexFactory.create(ax + t1 * dx, ay + t1 * dy);
    }

    if (this.leftSite && this.rightSite && (t0 > 0 || t1 < 1)) {
      siteAreaStore.get(this.leftSite.id).canBeClosed = true;
      siteAreaStore.get(this.rightSite.id).canBeClosed = true;
    }

    return true;
  }

  private addVertex(vertex: Point, siteA: Site, siteB: Site) {
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
