import { RbTree } from './utils/rbTree/RbTree';
import { RbTreeNode } from './utils/rbTree/RbTreeNode';
import { Edge } from './Edge';
import { CircleEvent, CircleEventQueue } from './CircleEventQueue';
import { EdgeManager } from './EdgeManager';
import { Site } from './Site';
import { VertexFactory } from './VertexFactory';
import { SiteArea } from './SiteArea';
import { HalfEdge } from './HalfEdge';
import { SiteAreaStore } from './SiteAreaStore';
import { PointUtils } from '../../../../utils/PointUtils';
import { Point } from '../../../../datatypes/Point';

export interface BeachSection {
  site: Site;
  edge?: Edge;
  circleEvent?: CircleEvent;
}

export interface BeachSectionNode extends BeachSection, RbTreeNode<BeachSectionNode> {}

export class BeachLine {
  private dataTree = new RbTree<BeachSectionNode>();

  private circleEvents: CircleEventQueue;
  private edgeManager: EdgeManager;
  private vertexFactory: VertexFactory;
  private siteAreaStore: SiteAreaStore;

  constructor(
    circleEvents: CircleEventQueue,
    edgeManager: EdgeManager,
    vertexFactory: VertexFactory,
    siteAreaStore: SiteAreaStore,
  ) {
    this.circleEvents = circleEvents;
    this.edgeManager = edgeManager;
    this.vertexFactory = vertexFactory;
    this.siteAreaStore = siteAreaStore;
  }

  addSectionFor(site: Site): void {
    this.siteAreaStore.put(site.id, new SiteArea(site));
    const sections = this.getSectionsFor(site);
    const leftSection = sections.leftSection;
    let rightSection = sections.rightSection;
    const newArc: BeachSectionNode = this.addNewSectionToExisting({ site }, leftSection);

    // the new section ...
    const isFirstBeachSection = !leftSection && !rightSection;
    const splitsExistingSection = leftSection && leftSection === rightSection;
    const isLastBeachSection = leftSection && !rightSection;
    const isExactlyBetweenTwoExistingSections = leftSection !== rightSection;

    if (isFirstBeachSection) {
      // do nothing
    } else if (splitsExistingSection && leftSection) {
      this.circleEvents.detachCurrent(leftSection);
      rightSection = this.addNewSectionToExisting({ site: leftSection.site }, newArc);
      const newEdge = this.addNewEdge(leftSection.site, newArc.site);
      newArc.edge = newEdge;
      rightSection.edge = newEdge;
      this.circleEvents.attachCircleEventIfNeededOnCollapse(leftSection);
      this.circleEvents.attachCircleEventIfNeededOnCollapse(rightSection);
    } else if (isLastBeachSection && leftSection) {
      newArc.edge = this.addNewEdge(leftSection.site, newArc.site);
    } else if (leftSection && rightSection && isExactlyBetweenTwoExistingSections) {
      this.circleEvents.detachCurrent(leftSection);
      this.circleEvents.detachCurrent(rightSection);

      const collapsingPoint = this.calculateCenterOfOutcircle(
        leftSection.site.point,
        site.point,
        rightSection.site.point,
      );
      const vertex = this.vertexFactory.create(collapsingPoint[Point.X], collapsingPoint[Point.Y]);
      this.createNewEdgeFrom(vertex, leftSection, rightSection);

      newArc.edge = this.addNewEdge(leftSection.site, site, undefined, vertex);
      rightSection.edge = this.addNewEdge(site, rightSection.site, undefined, vertex);

      this.circleEvents.attachCircleEventIfNeededOnCollapse(leftSection);
      this.circleEvents.attachCircleEventIfNeededOnCollapse(rightSection);
    }
  }

  removeSection(beachSection: BeachSectionNode): void {
    const { circleEvent, prev: previousSection, next: nextSection } = beachSection;
    if (!circleEvent || !previousSection || !nextSection) {
      return;
    }
    const vertex = this.vertexFactory.create(circleEvent.x, circleEvent.centerY);

    this.detachSection(beachSection, this.circleEvents);
    this.closeBeachBetween(previousSection, beachSection, nextSection, vertex);
  }

  private getSectionsFor(site: Site): {
    leftSection: BeachSectionNode | undefined;
    rightSection: BeachSectionNode | undefined;
  } {
    let node = this.dataTree.getRoot();
    let leftSection: BeachSectionNode | undefined = undefined;
    let rightSection: BeachSectionNode | undefined = undefined;

    while (node) {
      const leftBreakPointRelativeX = this.calculateLeftBreakPointX(node, site.point[Point.Y]) - site.point[Point.X];
      if (leftBreakPointRelativeX > PointUtils.TOLERANCE) {
        node = node.left;
      } else {
        const rightBreakPointRelativeX =
          site.point[Point.X] - this.calculateRightBreakPointX(node, site.point[Point.Y]);

        // x greaterThanWithTolerance boundary.right() => falls somewhere after the right edge of the beachsection
        if (rightBreakPointRelativeX > PointUtils.TOLERANCE) {
          if (!node.right) {
            return { leftSection: node, rightSection: undefined };
          }
          node = node.right;
        } else {
          // x isEqualWithTolerance boundary.left() => falls exactly on the left edge of the beachsection
          if (leftBreakPointRelativeX > -PointUtils.TOLERANCE) {
            leftSection = node.prev;
            rightSection = node;
          }

          // x isEqualWithTolerance boundary.right() => falls exactly on the right edge of the beachsection
          else if (rightBreakPointRelativeX > -PointUtils.TOLERANCE) {
            leftSection = node;
            rightSection = node.next;
          }

          // falls exactly somewhere in the middle of the beachsection
          else {
            leftSection = node;
            rightSection = node;
          }

          return { leftSection, rightSection };
        }
      }
    }
    return { leftSection, rightSection };
  }

  private closeBeachBetween(
    previousSection: BeachSectionNode,
    beachSection: BeachSectionNode,
    nextSection: BeachSectionNode,
    vertex: Point,
  ) {
    const leftBeach: BeachSectionNode[] = this.getLeftBeach(previousSection, vertex);
    this.circleEvents.detachCurrent(leftBeach[0]);

    const rightBeach: BeachSectionNode[] = this.getRightBeach(nextSection, vertex);
    this.circleEvents.detachCurrent(rightBeach[rightBeach.length - 1]);

    const collapsingSections: BeachSectionNode[] = [...leftBeach, beachSection, ...rightBeach];
    collapsingSections.forEach((rightSection: BeachSectionNode, i: number, arr: BeachSectionNode[]) => {
      if (i > 0) {
        const leftSection = arr[i - 1];
        this.createNewEdgeFrom(vertex, leftSection, rightSection);
      }
    });

    const leftSection = collapsingSections[0];
    const rightSection = collapsingSections[collapsingSections.length - 1];
    rightSection.edge = this.addNewEdge(leftSection.site, rightSection.site, undefined, vertex);

    this.circleEvents.attachCircleEventIfNeededOnCollapse(leftSection);
    this.circleEvents.attachCircleEventIfNeededOnCollapse(rightSection);
  }

  private getLeftBeach(section: BeachSectionNode, vertex: Point): BeachSectionNode[] {
    const leftBeach: BeachSectionNode[] = [];
    let leftSection_ = section;
    while (
      leftSection_.circleEvent &&
      leftSection_.prev &&
      Math.abs(vertex[Point.X] - leftSection_.circleEvent.x) < PointUtils.TOLERANCE &&
      Math.abs(vertex[Point.Y] - leftSection_.circleEvent.centerY) < PointUtils.TOLERANCE
    ) {
      const previousSection = leftSection_.prev;
      leftBeach.unshift(leftSection_);
      this.detachSection(leftSection_, this.circleEvents);
      leftSection_ = previousSection;
    }
    leftBeach.unshift(leftSection_);

    return leftBeach;
  }

  private getRightBeach(section: BeachSectionNode, vertex: Point): BeachSectionNode[] {
    const rightBeach: BeachSectionNode[] = [];
    let rightSection_ = section;
    while (
      rightSection_.circleEvent &&
      rightSection_.next &&
      Math.abs(vertex[Point.X] - rightSection_.circleEvent.x) < PointUtils.TOLERANCE &&
      Math.abs(vertex[Point.Y] - rightSection_.circleEvent.centerY) < PointUtils.TOLERANCE
    ) {
      const nextSection = rightSection_.next;
      rightBeach.push(rightSection_);
      this.detachSection(rightSection_, this.circleEvents);
      rightSection_ = nextSection;
    }
    rightBeach.push(rightSection_);

    return rightBeach;
  }

  private createNewEdgeFrom(vertex: Point, leftSection: BeachSection, rightSection: BeachSection) {
    rightSection.edge?.createStartpoint(vertex, leftSection.site, rightSection.site);
  }

  private calculateCenterOfOutcircle(a: Point, b: Point, c: Point) {
    // set origin to point a
    const d = [b[Point.X] - a[Point.X], b[Point.Y] - a[Point.Y]];
    const e = [c[Point.X] - a[Point.X], c[Point.Y] - a[Point.Y]];

    const f = 2 * (d[Point.X] * e[Point.Y] - d[Point.Y] * e[Point.X]);
    const hd = Math.pow(d[Point.X], 2) + Math.pow(d[Point.Y], 2);
    const he = Math.pow(e[Point.X], 2) + Math.pow(e[Point.Y], 2);
    const x = (e[Point.Y] * hd - d[Point.Y] * he) / f + a[Point.X];
    const y = (d[Point.X] * he - e[Point.X] * hd) / f + a[Point.Y];
    return [x, y];
  }

  private detachSection(beachSection: BeachSectionNode, circleEvents: CircleEventQueue): void {
    circleEvents.detachCurrent(beachSection);
    this.remove(beachSection);
  }

  private calculateLeftBreakPointX(beachSection: BeachSectionNode, sweepLineX: number): number {
    let site = beachSection.site;
    const rfocx = site.point[Point.X];
    const rfocy = site.point[Point.Y];
    const pby2 = rfocy - sweepLineX;

    if (!pby2) {
      return rfocx;
    }

    const leftSection = beachSection.prev;
    if (!leftSection) {
      return -Infinity;
    }

    site = leftSection.site;
    const lfocx = site.point[Point.X];
    const lfocy = site.point[Point.Y];
    const plby2 = lfocy - sweepLineX;

    if (!plby2) {
      return lfocx;
    }

    const hl = lfocx - rfocx,
      aby2 = 1 / pby2 - 1 / plby2,
      b = hl / plby2;

    if (aby2) {
      return (
        (-b + Math.sqrt(b * b - 2 * aby2 * ((hl * hl) / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 +
        rfocx
      );
    }

    return (rfocx + lfocx) / 2;
  }

  private calculateRightBreakPointX(beachSection: BeachSectionNode, sweepLineX: number): number {
    const rightSection = beachSection.next;
    if (rightSection) {
      return this.calculateLeftBreakPointX(rightSection, sweepLineX);
    } else {
      const site = beachSection.site;
      return site.point[Point.Y] === sweepLineX ? site.point[Point.X] : Infinity;
    }
  }

  private addNewSectionToExisting(newSection: BeachSectionNode, existingSection?: BeachSectionNode): BeachSectionNode {
    this.dataTree.insertAsSuccessorTo(newSection, existingSection);
    return newSection;
  }

  private remove(beachSection: BeachSectionNode) {
    this.dataTree.removeNode(beachSection);
  }

  private addNewEdge(leftSite: Site, rightSite: Site, va?: Point, vb?: Point): Edge {
    const edge: Edge = this.edgeManager.create(leftSite, rightSite);
    if (va) {
      edge.createStartpoint(va, leftSite, rightSite);
    }
    if (vb) {
      edge.createEndpoint(vb, leftSite, rightSite);
    }
    this.siteAreaStore.get(leftSite.id).halfEdges.push(new HalfEdge(edge, leftSite, rightSite));
    this.siteAreaStore.get(rightSite.id).halfEdges.push(new HalfEdge(edge, rightSite, leftSite));
    return edge;
  }
}
