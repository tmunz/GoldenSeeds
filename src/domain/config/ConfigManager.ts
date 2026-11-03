import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { configService } from './ConfigService';
import { RawConfig } from './RawConfig';
import { renderGraphToSvg } from '../graph/runtime/GraphRenderer';
import { fromRawConfig, toRawConfig } from '../graph/runtime/GraphSerializer';
import { preconfigs } from './data';
import { openDatabase } from '../../utils/IndexedDb';

export interface ConfigItem {
  name: string;
  preconfig: boolean;
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
    try {
      const db = await this.database();
      const items = await new Promise<ConfigItem[]>((resolve, reject) => {
        const request = db.transaction(ConfigManager.DB_TABLE).objectStore(ConfigManager.DB_TABLE).getAll();
        request.addEventListener('success', () => resolve(request.result));
        request.addEventListener('error', () => reject(request.error));
      });
      const existingItems = new Map(items.map(item => [item.name, item]));
      this.configItemMap$.next(existingItems);
      await Promise.all(preconfigs.map((preconfig, index) => {
        const existing = existingItems.get(preconfig.meta.name);
        if (!existing || existing.preconfig) { return this.save(preconfig, index, true); }
      }));
      await Promise.all(items.filter(item => item.preconfig && !preconfigs.some(config => config.meta.name === item.name))
        .map(item => this.delete(item.name)));
      this.configsManageable$.next(true);
    } catch {
      console.warn('configs could not be loaded');
      const items = preconfigs.map((rawConfig, sortIndex) => ({ name: rawConfig.meta.name, preconfig: true, rawConfig, svg: null, sortIndex }));
      this.configItemMap$.next(new Map(items.map(item => [item.name, item])));
      this.configsManageable$.next(false);
    }
  }

  select(name?: string, { updateUrl = true, reload = true }: { updateUrl?: boolean; reload?: boolean } = {}) {
    if (!reload && name === configService.config$.value.meta.name) {
      if (updateUrl) { this.updateUrl(name); }
      return Promise.resolve();
    }
    const item = this.configItemMap$.value.get(name ?? '');
    const rawConfig = item?.rawConfig ?? { meta: { name: '' }, nodes: [], edges: [] };
    return updateUrl
      ? this.load(rawConfig, { saved: Boolean(item) })
      : configService.setRawConfig(rawConfig, { saved: Boolean(item) });
  }

  /** A name that does not collide with any stored drawing, e.g. "name (2)". */
  uniqueName(name: string): string {
    const names = this.configItemMap$.value;
    let candidate = name;
    for (let suffix = 2; names.has(candidate); suffix++) { candidate = `${name} (${suffix})`; }
    return candidate;
  }

  async reset(name: string) {
    const rawConfig: RawConfig = { meta: { name }, nodes: [], edges: [] };
    const preconfig = preconfigs.find(c => c.meta.name === name);
    const config = this.configItemMap$.value.get(name);
    if (config) {
      await this.save(preconfig ?? rawConfig, config.sortIndex, true);
      await this.select(name);
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

  async save(rawConfig: RawConfig, sortIndex: number, preconfig = false): Promise<ConfigItem> {
    const db = await this.database();
    const config = await fromRawConfig(rawConfig);
    const data: ConfigItem = {
      name: rawConfig.meta.name,
      rawConfig: toRawConfig(config),
      svg: renderGraphToSvg(config.graph, 1000, 1000),
      sortIndex,
      preconfig,
    };
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ConfigManager.DB_TABLE], 'readwrite');
      transaction.addEventListener('complete', () => {
        const next = new Map(this.configItemMap$.value);
        next.set(data.name, data);
        this.configItemMap$.next(next);
        resolve(data);
      });
      transaction.addEventListener('abort', () => reject(transaction.error ?? new Error('Save aborted')));
      transaction.addEventListener('error', () => reject(transaction.error ?? new Error('Save failed')));
      transaction.objectStore(ConfigManager.DB_TABLE).put(data);
    });
  }

  load(rawConfig: RawConfig, { saved = false }: { saved?: boolean } = {}): Promise<void> {
    this.updateUrl(rawConfig.meta.name);
    return configService.setRawConfig(rawConfig, { saved });
  }

  private updateUrl(name: string): void {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('name', name);
    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString() + window.location.hash;
    if (newRelativePathQuery !== window.location.pathname + window.location.search + window.location.hash) {
      history.pushState(null, '', newRelativePathQuery);
    }
  }

  private database(): Promise<IDBDatabase> {
    return openDatabase(ConfigManager.DB_NAME, 1, (db) => {
      if (!db.objectStoreNames.contains(ConfigManager.DB_TABLE)) {
        const objectStore = db.createObjectStore(ConfigManager.DB_TABLE, {
          autoIncrement: false,
          keyPath: ConfigManager.DB_KEY,
        });
        objectStore.createIndex('sortIndex', 'sortIndex', { unique: true });
      }
    });
  }
}

export const configManager = new ConfigManager();
