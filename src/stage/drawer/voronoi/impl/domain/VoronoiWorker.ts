import { CircleEventQueue } from "./CircleEventQueue";
import { VertexFactory } from "./VertexFactory";
import { SiteAreaStore } from "./SiteAreaStore";
import { EdgeManager } from "./EdgeManager";
import { BeachLine, BeachSection } from "./BeachLine";
import { Queue } from "../utils/Queue";
import { Site } from "./Site";
import { Boundary } from "./Boundary";
import { Edge } from "./Edge";
import { Vertex } from "./Vertex";
import { DistanceHelper } from "./DistanceHelper";
import { SiteArea } from "./SiteArea";


export class VoronoiWorker {

  private circleEvents: CircleEventQueue = new CircleEventQueue();
  private vertexFactory: VertexFactory = new VertexFactory();
  private siteAreaStore: SiteAreaStore = new SiteAreaStore();
  private edgeManager: EdgeManager = new EdgeManager(this.vertexFactory, this.siteAreaStore);
  private beachLine: BeachLine = new BeachLine(this.circleEvents, this.edgeManager, this.vertexFactory, this.siteAreaStore);

  process(queue: Queue<Site>, boundary: Boundary): { edges: Edge[], vertices: Vertex[], siteAreas: SiteArea[] } {

    let site = queue.pop();

    while (site || this.circleEvents.getCurrent()) {
      if (this.shouldAddBeachSectionFor(site)) {
        if (!this.shouldIgnoreSite(site, queue.getPrevious())) {
          this.addNewBeachSectionFor(site);
        }
        site = queue.pop();
      } else {
        this.removeSectionFromBeach(this.circleEvents.getCurrent().arc);
      }
    }

    this.edgeManager.clean(boundary);
    this.closeSiteAreas(boundary);

    return {
      edges: this.edgeManager.getAll(),
      vertices: this.vertexFactory.getAll(),
      siteAreas: this.siteAreaStore.getAll()
    };
  }

  private shouldAddBeachSectionFor(site: Site): boolean {
    return site
      && (!this.circleEvents.getCurrent()
        || site.y < this.circleEvents.getCurrent().y
        || (site.y === this.circleEvents.getCurrent().y && site.x < this.circleEvents.getCurrent().x)
      );
  }

  private shouldIgnoreSite(site: Site, previousSite: Site) {
    return previousSite && DistanceHelper.isSamePosition(previousSite, site);
  }

  private addNewBeachSectionFor(site: Site): void {
    this.beachLine.addSectionFor(site);
  }

  private removeSectionFromBeach(beachLineSection: BeachSection): void {
    this.beachLine.removeSection(beachLineSection);
  }

  private closeSiteAreas(boundary: Boundary): void {
    const createBorderEdgeFun = (site: Site, start: Vertex, end: Vertex): Edge =>
      this.edgeManager.create(site, null, start, end);
    this.siteAreaStore.getAll().forEach(siteArea => siteArea.close(createBorderEdgeFun, boundary));
  }
}
