import { SiteArea } from './SiteArea';

export class SiteAreaStore {

  private data: SiteArea[] = [];

  get(id: number): SiteArea {
    return this.data[id];
  }

  put(id: number, siteArea: SiteArea): void {
    this.data[id] = siteArea;
  }

  getAll(): SiteArea[] {
    return this.data;
  }

}
