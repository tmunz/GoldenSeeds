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
        const svg = svgService.generateSvg(config.stages, 1000, 1000);
        const transaction = db.transaction([PreconfigService.DB_TABLE], 'readwrite');
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const data = { name, rawConfig, svg };
        const putRequest = objectStore.put({ ...data, sortIndex: i });
        putRequest.addEventListener('success', () => {
          if (i !== undefined) {
            const next = [...this.preconfigs$.value];
            next.splice(i, 0, data);
            this.preconfigs$.next(next);
          } else {
            this.preconfigs$.next([...this.preconfigs$.value, data]);
          }
          resolve(data);
        });
      }).catch(() => resolve());
    });
  }

  async list(): Promise<{ name: string, rawConfig: RawConfig, svg: string }[]> {
    return new Promise((resolve) => {
      this.database().then((db) => {
        const transaction = db.transaction(PreconfigService.DB_TABLE);
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const getRequest = objectStore.getAll();
        getRequest.addEventListener('success', (event) => {
          const list = (event.target as any).result as { name: string, rawConfig: RawConfig, svg: string, sortIndex: number }[];
          resolve(list.sort((a, b) => a.sortIndex - b.sortIndex));
        });
      }).catch(() => {
        console.warn('preconfigs could not be loaded');
        resolve([]);
      });
    });
  }

  private async get(name: string): Promise<{ name: string, rawConfig: RawConfig, svg: string }> {
    return new Promise((resolve) => {
      this.database().then((db) => {
        const transaction = db.transaction(PreconfigService.DB_TABLE);
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const getRequest = objectStore.get(name);
        getRequest.addEventListener('success', (event) => {
          const data = (event.target as any).result;
          resolve(data);
        });
      }).catch(async () => {
        console.warn('preconfig could not be found, use fallback')
        const rawConfig = require('./data/golden-seeds.json') as RawConfig;
        const config = await configService.convert(rawConfig);
        const svg = svgService.generateSvg(config.stages, 1000, 1000);
        const data = { name, rawConfig, svg };
        resolve(data);
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
      dbOpenEvent.addEventListener('error', (event: Event) => {
        reject(event);
      });
    });
  }
}

export const preconfigService = new PreconfigService();
