import { RbTree } from '../utils/rbTree/RbTree';
import { RbTreeNode } from '../utils/rbTree/RbTreeNode';
import { BeachSection } from './BeachLine';

export interface CircleEvent extends BeachSection, RbTreeNode<CircleEvent> {}

export class CircleEventQueue {
  private dataTree = new RbTree<CircleEvent>();
  private current: CircleEvent;

  getCurrent(): CircleEvent {
    return this.current;
  }

  detachCurrent(arc: CircleEvent): void {
    const circleEvent = arc.circleEvent;
    if (circleEvent) {
      if (!circleEvent.prev) {
        this.current = circleEvent.next;
      }
      this.dataTree.removeNode(circleEvent);
      arc.circleEvent = null;
    }
  }

  attachCircleEventIfNeededOnCollapse(arc: CircleEvent): void {
    const lArc = arc.prev;
    const rArc = arc.next;

    if (!lArc || !rArc) {
      return;
    }

    const lSite = lArc.site;
    const cSite = arc.site;
    const rSite = rArc.site;

    // If site of left beachsection is same as site of
    // right beachsection, there can't be convergence
    if (lSite === rSite) {
      return;
    }

    // Find the circumscribed circle for the three sites associated
    // with the beachsection triplet.
    // rhill 2011-05-26: It is more efficient to calculate in-place
    // rather than getting the resulting circumscribed circle from an
    // object returned by calling Voronoi.circumcircle()
    // http://mathforum.org/library/drmath/view/55002.html
    // Except that I bring the origin at cSite to simplify calculations.
    // The bottom-most part of the circumcircle is our Fortune 'circle
    // event', and its center is a vertex potentially part of the final
    // Voronoi diagram.
    const bx = cSite.x;
    const by = cSite.y;
    const ax = lSite.x - bx;
    const ay = lSite.y - by;
    const cx = rSite.x - bx;
    const cy = rSite.y - by;

    // If points l->c->r are clockwise, then center beach section does not
    // collapse, hence it can't end up as a vertex (we reuse 'd' here, which
    // sign is reverse of the orientation, hence we reverse the test.
    // http://en.wikipedia.org/wiki/Curve_orientation#Orientation_of_a_simple_polygon
    // rhill 2011-05-21: Nasty finite precision error which caused circumcircle() to
    // return infinites: 1e-12 seems to fix the problem.
    const d = 2 * (ax * cy - ay * cx);
    if (d >= -2e-12) {
      return;
    }

    const ha = ax * ax + ay * ay,
      hc = cx * cx + cy * cy,
      x = (cy * ha - ay * hc) / d,
      y = (ax * hc - cx * ha) / d,
      centerY = y + by;

    // Important: boundary.bottom()ottom should always be under or at sweep, so no need
    // to waste CPU cycles by checking

    const circleEvent: CircleEvent = {
      arc,
      site: cSite,
      x: x + bx,
      y: centerY + Math.sqrt(x * x + y * y),
      centerY,
    };

    arc.circleEvent = circleEvent;
    this.push(circleEvent);
  }

  private push(circleEvent: CircleEvent): void {
    let predecessor: CircleEvent = null;
    let node: CircleEvent = this.dataTree.getRoot();

    while (node) {
      if (
        circleEvent.y < node.y ||
        (circleEvent.y === node.y && circleEvent.x <= node.x)
      ) {
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

    this.insert(predecessor, circleEvent);
  }

  private insert(predecessor: CircleEvent, circleEvent: CircleEvent) {
    this.dataTree.insertAsSuccessorTo(circleEvent, predecessor);
    if (!predecessor) {
      this.current = circleEvent;
    }
  }
}
