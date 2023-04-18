import { preconfigs } from './data';
import { configService } from '../config/ConfigService';
import { BehaviorSubject } from 'rxjs';
import { RawConfig } from '../config/RawConfig';

export class PreconfigService {
  preconfig$ = new BehaviorSubject<string>('golden seeds');

  private static DB_NAME = 'config';
  private static DB_TABLE = 'configData';
  private static DB_KEY = 'name';

  async selectPreconfigByName(name = 'golden seeds') {
    this.selectPreconfig(await this.get(name));
  }

  selectPreconfig(rawConfig: RawConfig) {
    this.preconfig$.next(rawConfig.meta.name);
    configService.setRawConfig(rawConfig);
  }

  save(rawConfig: RawConfig): string {
    const name = rawConfig.meta.name;
    this.database().then((db) => {
      const transaction = db.transaction([PreconfigService.DB_TABLE], 'readwrite');
      const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
      objectStore.add({ name, data: rawConfig });
    });
    return name;
  }

  async list(): Promise<{ name: string, rawConfig: RawConfig }[]> {
    return new Promise((resolve, reject) => {
      this.database().then((db) => {
        const transaction = db.transaction(PreconfigService.DB_TABLE);
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const getRequest = objectStore.getAll();
        getRequest.addEventListener('success', (event) => {
          const list = (event.target as any).result as { name: string, rawConfig: RawConfig, sortIndex: number }[];
          resolve(list.sort((a, b) => a.sortIndex - b.sortIndex));
        });
        getRequest.addEventListener('error', (event) => {
          reject(event);
        });
      });
    });
  }

  private async get(name: string): Promise<RawConfig> {
    return new Promise((resolve, reject) => {
      this.database().then((db) => {
        const transaction = db.transaction(PreconfigService.DB_TABLE);
        const objectStore = transaction.objectStore(PreconfigService.DB_TABLE);
        const getRequest = objectStore.get(name);
        getRequest.addEventListener('success', (event) => {
          const data = (event.target as any).result?.rawConfig;
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
          preconfigs.forEach((preconfig, i) =>
            objectStore.add({ name: preconfig.meta.name, sortIndex: i, rawConfig: preconfig }));
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
