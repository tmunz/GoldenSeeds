import { CircleEventQueue } from './CircleEventQueue';
import { VertexFactory } from './VertexFactory';
import { SiteAreaStore } from './SiteAreaStore';
import { EdgeManager } from './EdgeManager';
import { BeachLine, BeachSection } from './BeachLine';
import { Queue } from './utils/Queue';
import { Site } from './Site';
import { Boundary } from './Boundary';
import { Edge } from './Edge';
import { SiteArea } from './SiteArea';
import { PointUtils } from '../../../../utils/PointUtils';
import { Point } from '../../../../datatypes/Point';

export class VoronoiWorker {
  private circleEvents: CircleEventQueue = new CircleEventQueue();
  private vertexFactory: VertexFactory = new VertexFactory();
  private siteAreaStore: SiteAreaStore = new SiteAreaStore();
  private edgeManager: EdgeManager = new EdgeManager(this.vertexFactory, this.siteAreaStore);
  private beachLine: BeachLine = new BeachLine(
    this.circleEvents,
    this.edgeManager,
    this.vertexFactory,
    this.siteAreaStore,
  );

  process(queue: Queue<Site>, boundary: Boundary): { edges: Edge[]; vertices: Point[]; siteAreas: SiteArea[] } {
    let site = queue.pop();
    while (site || this.circleEvents.getCurrent()) {
      if (this.shouldAddBeachSectionFor(site)) {
        if (site && !this.shouldIgnoreSite(site, queue.getPrevious())) {
          this.addNewBeachSectionFor(site);
        }
        site = queue.pop();
      } else {
        const currentEvent = this.circleEvents.getCurrent();
        if (currentEvent) {
          this.removeSectionFromBeach(currentEvent.arc);
        }
      }
    }

    this.edgeManager.clean(boundary);
    this.closeSiteAreas(boundary);

    return {
      edges: this.edgeManager.getAll(),
      vertices: this.vertexFactory.getAll(),
      siteAreas: this.siteAreaStore.getAll(),
    };
  }

  private shouldAddBeachSectionFor(site?: Site): boolean {
    const currentCircleEvent = this.circleEvents.getCurrent();
    return site !== undefined && (!currentCircleEvent || site.point[Point.Y] < currentCircleEvent.y ||
      (site.point[Point.Y] === currentCircleEvent.y && site.point[Point.X] < currentCircleEvent.x));
  }

  private shouldIgnoreSite(site?: Site, previousSite?: Site): boolean {
    return site !== undefined && previousSite !== undefined && PointUtils.isSamePoint(previousSite.point, site.point);
  }

  private addNewBeachSectionFor(site: Site): void {
    this.beachLine.addSectionFor(site);
  }

  private removeSectionFromBeach(beachLineSection: BeachSection): void {
    this.beachLine.removeSection(beachLineSection);
  }

  private closeSiteAreas(boundary: Boundary): void {
    const createBorderEdgeFun = (site: Site, start: Point, end: Point): Edge =>
      this.edgeManager.create(site, undefined, start, end);
    this.siteAreaStore.getAll().forEach((siteArea) => siteArea.close(createBorderEdgeFun, boundary));
  }
}
