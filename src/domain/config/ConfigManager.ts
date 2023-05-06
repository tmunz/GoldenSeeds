import { configService, ConfigService } from '../config/ConfigService';
import { BehaviorSubject } from 'rxjs';
import { RawConfig } from '../config/RawConfig';
import { svgService } from '../svg/SvgService';
import { preconfigs } from './data';

export class ConfigManager {

  configsManageable$ = new BehaviorSubject<boolean>(false);
  configs$ = new BehaviorSubject<{ name: string; rawConfig: RawConfig; svg: string | null; sortIndex: number; }[]>([]);

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
          const list = ((event.target as any)
            .result as { name: string, rawConfig: RawConfig, svg: string, sortIndex: number }[])
            .sort((a, b) => a.sortIndex - b.sortIndex);
          if (list.length === 0) {
            await Promise.all(preconfigs.map((preconfig, i) => {
              configManager.save(preconfig, i);
            }));
          } else {
            this.configs$.next(list);
          }
          this.configsManageable$.next(true);
          resolve();
        });
      }).catch(() => {
        console.warn('configs could not be loaded');
        const configs = preconfigs.map((rawConfig, i) => ({ name: rawConfig.meta.name, rawConfig, svg: null, sortIndex: i }));
        this.configs$.next(configs);
        resolve();
      });
    });
  }

  selectByName(name = 'golden seeds') {
    const config = this.configs$.value.find(c => c.rawConfig.meta.name === name);
    config && this.selectPreconfig(config.rawConfig);
  }

  selectByDelta(delta: number) {
    const configs = this.configs$.value;
    const currentIndex = configs.findIndex(c => c.rawConfig.meta.name === configService.config$.value.meta.name);
    const nextIndex = (currentIndex + delta + configs.length) % configs.length;
    this.selectPreconfig(configs[nextIndex].rawConfig);
  }

  private selectPreconfig(rawConfig: RawConfig) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('name', rawConfig.meta.name);
    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
    configService.setRawConfig(rawConfig);
  }

  async reset(name: string) {
    const configs = this.configs$.value;
    const currentIndex = configs.findIndex(c => c.rawConfig.meta.name === name);
    const preconfigIndex = preconfigs.findIndex(c => c.meta.name === name);
    if (0 <= preconfigIndex && currentIndex === preconfigIndex) {
      await this.save(preconfigs[preconfigIndex], preconfigIndex);
      this.selectByName(name);
    }
  }

  async save(rawConfig: RawConfig, i?: number): Promise<{ name: string; rawConfig: RawConfig; svg: string; sortIndex: number; }> {
    const name = rawConfig.meta.name;
    return new Promise((resolve, reject) => {
      return this.database().then(async (db) => {
        const config = await ConfigService.convert(rawConfig);
        const svg = svgService.generateSvg(config.stages, 1000, 1000);
        const transaction = db.transaction([ConfigManager.DB_TABLE], 'readwrite');
        const objectStore = transaction.objectStore(ConfigManager.DB_TABLE);
        const sortIndex = i ?? preconfigs.findIndex(p => p.meta.name === name) ?? preconfigs.length;
        const data = { name, rawConfig, svg, sortIndex };
        const putRequest = objectStore.put({ ...data });
        putRequest.addEventListener('success', () => {
          const next = [...this.configs$.value];
          next[sortIndex] = data;
          this.configs$.next(next);
          resolve(data);
        });
      }).catch(() => resolve());
    });
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
