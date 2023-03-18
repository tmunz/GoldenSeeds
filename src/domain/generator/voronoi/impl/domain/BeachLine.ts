import { RbTree } from '../utils/rbTree/RbTree';
import { RbTreeNode } from '../utils/rbTree/RbTreeNode';
import { Edge } from './Edge';
import { CircleEventQueue } from './CircleEventQueue';
import { EdgeManager } from './EdgeManager';
import { Vertex } from './Vertex';
import { Site } from './Site';
import { VertexFactory } from './VertexFactory';
import { SiteArea } from './SiteArea';
import { DistanceHelper } from './DistanceHelper';
import { HalfEdge } from './HalfEdge';
import { SiteAreaStore } from './SiteAreaStore';

export interface BeachSection {
  site?: Site;
  edge?: Edge;
  arc?: BeachSectionNode;
  circleEvent?: BeachSectionNode;
  x?: number;
  y?: number;
  centerY?: number;
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
    let { leftSection, rightSection } = this.getSectionsFor(site);

    const newArc: BeachSection = this.addNewSectionToExisting({ site }, leftSection);

    // the new section ...
    const isFirstBeachSection = !leftSection && !rightSection;
    const splitsExistingSection = leftSection && leftSection === rightSection;
    const isLastBeachSection = leftSection && !rightSection;
    const isExactlyBetweenTwoExistingSections = leftSection !== rightSection;

    if (isFirstBeachSection) {
      // do nothing
    } else if (splitsExistingSection) {
      this.circleEvents.detachCurrent(leftSection);
      rightSection = { site: leftSection.site };
      this.addNewSectionToExisting(rightSection, newArc);
      const newEdge = this.addNewEdge(leftSection.site, newArc.site);
      newArc.edge = newEdge;
      rightSection.edge = newEdge;
      this.circleEvents.attachCircleEventIfNeededOnCollapse(leftSection);
      this.circleEvents.attachCircleEventIfNeededOnCollapse(rightSection);
    } else if (isLastBeachSection) {
      newArc.edge = this.addNewEdge(leftSection.site, newArc.site);
    } else if (isExactlyBetweenTwoExistingSections) {
      this.circleEvents.detachCurrent(leftSection);
      this.circleEvents.detachCurrent(rightSection);

      const collapsingPoint = this.calculateCenterOfOutcircle(leftSection.site, site, rightSection.site);
      const vertex = this.vertexFactory.create(collapsingPoint.x, collapsingPoint.y);

      this.createNewEdgeFrom(vertex, leftSection, rightSection);

      newArc.edge = this.addNewEdge(leftSection.site, site, undefined, vertex);
      rightSection.edge = this.addNewEdge(site, rightSection.site, undefined, vertex);

      this.circleEvents.attachCircleEventIfNeededOnCollapse(leftSection);
      this.circleEvents.attachCircleEventIfNeededOnCollapse(rightSection);
    }
  }

  removeSection(beachSection: BeachSectionNode): void {
    const vertex = this.vertexFactory.create(beachSection.circleEvent.x, beachSection.circleEvent.centerY);
    const previousSection = beachSection.prev;
    const nextSection = beachSection.next;

    this.detachSection(beachSection, this.circleEvents);
    this.closeBeachBetween(previousSection, beachSection, nextSection, vertex);
  }

  private getSectionsFor(site: Site): {
    leftSection: BeachSection;
    rightSection: BeachSection;
  } {
    let node = this.dataTree.getRoot();
    let leftSection, rightSection;

    while (node) {
      const leftBreakPointRelativeX = this.calculateLeftBreakPointX(node, site.y) - site.x;
      if (leftBreakPointRelativeX > DistanceHelper.tolerance) {
        node = node.left;
      } else {
        const rightBreakPointRelativeX = site.x - this.calculateRightBreakPointX(node, site.y);

        // x greaterThanWithTolerance boundary.right() => falls somewhere after the right edge of the beachsection
        if (rightBreakPointRelativeX > DistanceHelper.tolerance) {
          if (!node.right) {
            return { leftSection: node, rightSection: null };
          }
          node = node.right;
        } else {
          // x isEqualWithTolerance boundary.left() => falls exactly on the left edge of the beachsection
          if (leftBreakPointRelativeX > -DistanceHelper.tolerance) {
            leftSection = node.prev;
            rightSection = node;
          }

          // x isEqualWithTolerance boundary.right() => falls exactly on the right edge of the beachsection
          else if (rightBreakPointRelativeX > -DistanceHelper.tolerance) {
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
    vertex: Vertex,
  ) {
    const leftBeach: BeachSection[] = this.getLeftBeach(previousSection, vertex);
    this.circleEvents.detachCurrent(leftBeach[0]);

    const rightBeach: BeachSection[] = this.getRightBeach(nextSection, vertex);
    this.circleEvents.detachCurrent(rightBeach[rightBeach.length - 1]);

    const collapsingSections: BeachSection[] = [...leftBeach, beachSection, ...rightBeach];
    collapsingSections.forEach((rightSection: BeachSection, i: number, arr: BeachSection[]) => {
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

  private getLeftBeach(section: BeachSectionNode, vertex: Vertex): BeachSection[] {
    const leftBeach: BeachSection[] = [];
    let previousSection = section;
    let leftSection_ = section;
    while (
      leftSection_.circleEvent &&
      Math.abs(vertex.x - leftSection_.circleEvent.x) < DistanceHelper.tolerance &&
      Math.abs(vertex.y - leftSection_.circleEvent.centerY) < DistanceHelper.tolerance
    ) {
      previousSection = leftSection_.prev;
      leftBeach.unshift(leftSection_);
      this.detachSection(leftSection_, this.circleEvents);
      leftSection_ = previousSection;
    }
    leftBeach.unshift(leftSection_);

    return leftBeach;
  }

  private getRightBeach(section: BeachSectionNode, vertex: Vertex): BeachSection[] {
    const rightBeach = [];
    let nextSection = section;
    let rightSection_ = section;
    while (
      rightSection_.circleEvent &&
      Math.abs(vertex.x - rightSection_.circleEvent.x) < DistanceHelper.tolerance &&
      Math.abs(vertex.y - rightSection_.circleEvent.centerY) < DistanceHelper.tolerance
    ) {
      nextSection = rightSection_.next;
      rightBeach.push(rightSection_);
      this.detachSection(rightSection_, this.circleEvents);
      rightSection_ = nextSection;
    }
    rightBeach.unshift(rightSection_);

    return rightBeach;
  }

  private createNewEdgeFrom(vertex: Vertex, leftSection: BeachSection, rightSection: BeachSection) {
    rightSection.edge.createStartpoint(vertex, leftSection.site, rightSection.site);
  }

  private calculateCenterOfOutcircle(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number },
  ) {
    // set origin to point a
    const d = { x: b.x - a.x, y: b.y - a.y };
    const e = { x: c.x - a.x, y: c.y - a.y };

    const f = 2 * (d.x * e.y - d.y * e.x);
    const hd = Math.pow(d.x, 2) + Math.pow(d.y, 2);
    const he = Math.pow(e.x, 2) + Math.pow(e.y, 2);
    const x = (e.y * hd - d.y * he) / f + a.x;
    const y = (d.x * hd - e.x * he) / f + a.y;
    return { x, y };
  }

  private detachSection(beachSection: BeachSection, circleEvents: CircleEventQueue): void {
    circleEvents.detachCurrent(beachSection);
    this.remove(beachSection);
  }

  private calculateLeftBreakPointX(beachSection: BeachSectionNode, sweepLineX: number): number {
    let site = beachSection.site;
    const rfocx = site.x;
    const rfocy = site.y;
    const pby2 = rfocy - sweepLineX;

    if (!pby2) {
      return rfocx;
    }

    const leftSection = beachSection.prev;
    if (!leftSection) {
      return -Infinity;
    }

    site = leftSection.site;
    const lfocx = site.x;
    const lfocy = site.y;
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
      return site.y === sweepLineX ? site.x : Infinity;
    }
  }

  private addNewSectionToExisting(newSection: BeachSection, existingSection: BeachSection) {
    this.dataTree.insertAsSuccessorTo(newSection, existingSection);
    return newSection;
  }

  private remove(beachSection: BeachSection) {
    this.dataTree.removeNode(beachSection);
  }

  private addNewEdge(leftSite: Site, rightSite: Site, va?: Vertex, vb?: Vertex): Edge {
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
