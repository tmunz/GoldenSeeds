import { Font, parse } from 'opentype.js';

export class FontService {
  private static DB_NAME = 'font';
  private static DB_TABLE = 'fontData';
  private static DB_KEY = 'fontName';

  constructor() {
    this.init();
  }

  async init() {
    this.saveBuffer(await (await fetch(require('./signika-bold.otf'))).arrayBuffer());
  }

  async saveFromPath(path: string) {
    const buffer = await (await fetch(path)).arrayBuffer();
    this.saveBuffer(buffer);
  }

  saveBuffer(buffer: ArrayBuffer): string {
    const font = parse(buffer);
    const fontName = font.names.fullName.en;
    this.database().then((db) => {
      const transaction = db.transaction([FontService.DB_TABLE], 'readwrite');
      const objectStore = transaction.objectStore(FontService.DB_TABLE);
      objectStore.add({ fontName, data: buffer });
    });
    return fontName;
  }

  async listFonts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.database().then((db) => {
        const transaction = db.transaction(FontService.DB_TABLE);
        const objectStore = transaction.objectStore(FontService.DB_TABLE);
        const getRequest = objectStore.getAllKeys();
        getRequest.addEventListener('success', (event) => {
          const list = (event.target as any).result;
          resolve(list);
        });
        getRequest.addEventListener('error', (event) => {
          reject(event);
        });
      });
    });
  }

  async get(fontName: string): Promise<Font> {
    return new Promise((resolve, reject) => {
      this.database().then((db) => {
        const transaction = db.transaction(FontService.DB_TABLE);
        const objectStore = transaction.objectStore(FontService.DB_TABLE);
        const getRequest = objectStore.get(fontName);
        getRequest.addEventListener('success', (event) => {
          const data = (event.target as any).result?.data;
          resolve(parse(data));
        });
        getRequest.addEventListener('error', (event) => {
          reject(event);
        });
      });
    });
  }

  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbOpenEvent = window.indexedDB.open(FontService.DB_NAME, 1);
      dbOpenEvent.addEventListener('upgradeneeded', (event: Event) => {
        const db = (event.target as any).result as IDBDatabase;
        if (!db.objectStoreNames.contains(FontService.DB_TABLE)) {
          const objectStore = db.createObjectStore(FontService.DB_TABLE, {
            autoIncrement: false,
            keyPath: FontService.DB_KEY,
          });
          objectStore.createIndex('data', 'data', { unique: false });
        }
      });
      dbOpenEvent.addEventListener('success', (event: Event) => {
        const db = (event.target as any).result as IDBDatabase;
        resolve(db);
      });
    });
  }
}

export const fontService = new FontService();
