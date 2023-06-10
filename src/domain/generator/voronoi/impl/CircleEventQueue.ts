import { RbTree } from './utils/rbTree/RbTree';
import { RbTreeNode } from './utils/rbTree/RbTreeNode';
import { Site } from './Site';
import { Point } from '../../../../datatypes/Point';
import { BeachSectionNode } from './BeachLine';

export interface CircleEvent extends RbTreeNode<CircleEvent> {
  x: number;
  y: number;
  site: Site;
  centerY: number;
  arc: BeachSectionNode;
  circleEvent: CircleEvent;
}

export class CircleEventQueue {
  private dataTree = new RbTree<CircleEvent>();
  private current: CircleEvent | undefined = undefined;

  getCurrent(): CircleEvent | undefined {
    return this.current;
  }

  detachCurrent(arc?: CircleEvent): void {
    if (arc) {
      const circleEvent = arc.circleEvent;
      if (circleEvent) {
        if (!circleEvent.prev) {
          this.current = circleEvent.next;
        }
        this.dataTree.removeNode(circleEvent);
        arc.circleEvent = undefined;
      }
    }
  }

  private circumCircle(a: Site, b: Site, c: Site): { x: number; y: number; centerY: number; bx: number } | undefined {
    const bx = b.point[Point.X];
    const by = b.point[Point.Y];
    const ax = a.point[Point.X] - bx;
    const ay = a.point[Point.Y] - by;
    const cx = c.point[Point.X] - bx;
    const cy = c.point[Point.Y] - by;

    const d = 2 * (ax * cy - ay * cx);
    if (d < -2e-12) {
      const ha = ax * ax + ay * ay;
      const hc = cx * cx + cy * cy;
      const x = (cy * ha - ay * hc) / d;
      const y = (ax * hc - cx * ha) / d;
      const centerY = y + by;
      return { x, y, centerY, bx };
    }
  }

  attachCircleEventIfNeededOnCollapse(arc: CircleEvent): void {
    const lArc = arc.prev;
    const rArc = arc.next;
    if (lArc?.site && rArc?.site && arc?.site && lArc.site !== rArc.site) {
      const circumCircle = this.circumCircle(lArc.site, arc.site, rArc.site);
      if (circumCircle) {
        const circleEvent: CircleEvent = {
          arc,
          site: arc.site,
          x: circumCircle.x + circumCircle.bx,
          y: circumCircle.centerY + Math.sqrt(circumCircle.x ** 2 + circumCircle.y ** 2),
          centerY: circumCircle.centerY,
        };
        arc.circleEvent = circleEvent;
        this.push(circleEvent);
      }
    }
  }

  private push(circleEvent: CircleEvent): void {
    let predecessor: CircleEvent | undefined;
    let node: CircleEvent | undefined = this.dataTree.getRoot();

    while (node) {
      if (circleEvent.y < node.y || (circleEvent.y === node.y && circleEvent.x <= node.x)) {
        if (node.left) {
          node = node.left;
        } else {
          predecessor = node.prev;
          break;
        }
      } else {
        if (node.right) {
          node = node.right;
        } else {
          predecessor = node;
          break;
        }
      }
    }

    this.insert(circleEvent, predecessor);
  }

  private insert(circleEvent: CircleEvent, predecessor?: CircleEvent) {
    this.dataTree.insertAsSuccessorTo(circleEvent, predecessor);
    if (!predecessor) {
      this.current = circleEvent;
    }
  }
}
