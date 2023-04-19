import { configService } from '../config/ConfigService';
import { BehaviorSubject } from 'rxjs';
import { RawConfig } from '../config/RawConfig';
import { svgService } from '../svg/SvgService';

export class PreconfigService {

  preconfigs$ = new BehaviorSubject<{ name: string; rawConfig: RawConfig; svg: string; }[]>([]);
  selectedPreconfig$ = new BehaviorSubject<string>('golden seeds');

  private static DB_NAME = 'config';
  private static DB_TABLE = 'configData';
  private static DB_KEY = 'name';

  async selectPreconfigByName(name = 'golden seeds') {
    const preconfig = await this.get(name);
    this.selectPreconfig(preconfig.rawConfig);
  }

  selectPreconfig(rawConfig: RawConfig) {
    this.selectedPreconfig$.next(rawConfig.meta.name);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('name', rawConfig.meta.name);
    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
    configService.setRawConfig(rawConfig);
  }

  async save(rawConfig: RawConfig, i?: number): Promise<{ name: string; rawConfig: RawConfig; svg: string; }> {
    const name = rawConfig.meta.name;
    return new Promise((resolve, reject) => {
      return this.database().then(async (db) => {
        const config = await configService.convert(rawConfig);
        const svg = svgService.generateSvg(config.stages, 100, 100);
        const transaction = db.transaction([PreconfigService.DB_TABLE], 'readwrite');
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const data = { name, rawConfig, svg };
        objectStore.put({ ...data, sortIndex: i });
        this.preconfigs$.next([...this.preconfigs$.value, data]);
        resolve(data);
      }).catch((event) => reject(event));
    });
  }

  async list(): Promise<{ name: string, rawConfig: RawConfig, svg: string }[]> {
    return new Promise((resolve, reject) => {
      this.database().then((db) => {
        const transaction = db.transaction(PreconfigService.DB_TABLE);
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const getRequest = objectStore.getAll();
        getRequest.addEventListener('success', (event) => {
          const list = (event.target as any).result as { name: string, rawConfig: RawConfig, svg: string, sortIndex: number }[];
          resolve(list.sort((a, b) => a.sortIndex - b.sortIndex));
        });
        getRequest.addEventListener('error', (event) => {
          reject(event);
        });
      });
    });
  }

  private async get(name: string): Promise<{ name: string, rawConfig: RawConfig, svg: string }> {
    return new Promise((resolve, reject) => {
      this.database().then((db) => {
        const transaction = db.transaction(PreconfigService.DB_TABLE);
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const getRequest = objectStore.get(name);
        getRequest.addEventListener('success', (event) => {
          const data = (event.target as any).result;
          resolve(data);
        });
        getRequest.addEventListener('error', (event) => {
          reject(event);
        });
      });
    });
  }

  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbOpenEvent = window.indexedDB.open(PreconfigService.DB_NAME, 1);
      dbOpenEvent.addEventListener('upgradeneeded', (event: Event) => {
        const db = (event.target as any).result as IDBDatabase;
        if (!db.objectStoreNames.contains(PreconfigService.DB_TABLE)) {
          const objectStore = db.createObjectStore(PreconfigService.DB_TABLE, {
            autoIncrement: false,
            keyPath: PreconfigService.DB_KEY,
          });
          objectStore.createIndex('sortIndex', 'sortIndex', { unique: true });
        }
      });
      dbOpenEvent.addEventListener('success', (event: Event) => {
        const db = (event.target as any).result as IDBDatabase;
        resolve(db);
      });
    });
  }
}

export const preconfigService = new PreconfigService();
