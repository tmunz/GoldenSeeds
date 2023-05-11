import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { configService, ConfigService } from '../config/ConfigService';
import { RawConfig } from '../config/RawConfig';
import { svgService } from '../svg/SvgService';
import { preconfigs } from './data';


export interface ConfigItem {
  name: string;
  rawConfig: RawConfig;
  svg: string | null;
  sortIndex: number;
}

export class ConfigManager {

  configsManageable$ = new BehaviorSubject<boolean>(false);
  private configItemMap$ = new BehaviorSubject<Map<string, ConfigItem>>(new Map());
  configItems$ = this.configItemMap$.pipe(map(configItemMap => [...configItemMap.values()].sort((a, b) => a.sortIndex - b.sortIndex)));

  private static DB_NAME = 'config';
  private static DB_TABLE = 'configData';
  private static DB_KEY = 'name';

  async init(): Promise<void> {
    return new Promise((resolve) => {
      this.database().then((db) => {
        const transaction = db.transaction(ConfigManager.DB_TABLE);
        const objectStore = transaction.objectStore(ConfigManager.DB_TABLE);
        const getRequest = objectStore.getAll();
        getRequest.addEventListener('success', async (event) => {
          const list = ((event.target as any).result as ConfigItem[]);
          if (list.length === 0) {
            await Promise.all(preconfigs.map((preconfig, i) => configManager.save(preconfig, i)));
          } else {
            this.configItemMap$.next(new Map(list.map(item => [item.name, item])));
          }
          this.configsManageable$.next(true);
          resolve();
        });
      }).catch(() => {
        console.warn('configs could not be loaded');
        const list = preconfigs.map((rawConfig, i) => ({ name: rawConfig.meta.name, rawConfig, svg: null, sortIndex: i }));
        this.configItemMap$.next(new Map(list.map(item => [item.name, item])));
        resolve();
      });
    });
  }

  select(name?: string) {
    const config = this.configItemMap$.value.get(name ?? '') ?? { rawConfig: { meta: { name: '' }, stages: [] } };
    this.setConfig(config.rawConfig);
  }

  async reset(name: string) {
    let rawConfig: RawConfig = { meta: { name }, stages: [] };
    const preconfig = preconfigs.find(c => c.meta.name === name);
    const config = this.configItemMap$.value.get(name);
    if (config) {
      await this.save(preconfig ?? rawConfig, config.sortIndex);
      this.select(name);
    }
  }

  async delete(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      return this.database().then(async (db) => {
        const transaction = db.transaction([ConfigManager.DB_TABLE], 'readwrite');
        const objectStore = transaction.objectStore(ConfigManager.DB_TABLE);
        const deleteRequest = objectStore.delete(name);
        deleteRequest.addEventListener('success', () => {
          const next = new Map(this.configItemMap$.value);
          next.delete(name);
          this.configItemMap$.next(next);
          resolve(true);
        });
      }).catch(() => resolve(false));
    });
  }

  async save(rawConfig: RawConfig, sortIndex: number): Promise<ConfigItem> {
    const name = rawConfig.meta.name;
    return new Promise((resolve) => {
      return this.database().then(async (db) => {
        const config = await ConfigService.convert(rawConfig);
        const svg = svgService.generateSvg(config.stages, 1000, 1000);
        const transaction = db.transaction([ConfigManager.DB_TABLE], 'readwrite');
        const objectStore = transaction.objectStore(ConfigManager.DB_TABLE);
        const data = { name, rawConfig, svg, sortIndex };
        const putRequest = objectStore.put(data);
        putRequest.addEventListener('success', () => {
          const next = new Map(this.configItemMap$.value);
          next.set(data.name, data);
          this.configItemMap$.next(next);
          resolve(data);
        });
      }).catch(() => resolve());
    });
  }

  private setConfig(rawConfig: RawConfig) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('name', rawConfig.meta.name);
    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
    configService.setRawConfig(rawConfig);
  }

  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbOpenEvent = window.indexedDB.open(ConfigManager.DB_NAME, 1);
      dbOpenEvent.addEventListener('upgradeneeded', (event: Event) => {
        const db = (event.target as any).result as IDBDatabase;
        if (!db.objectStoreNames.contains(ConfigManager.DB_TABLE)) {
          const objectStore = db.createObjectStore(ConfigManager.DB_TABLE, {
            autoIncrement: false,
            keyPath: ConfigManager.DB_KEY,
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

export const configManager = new ConfigManager();
