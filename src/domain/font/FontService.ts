import { Font, parse } from 'opentype.js';

const SignikaBoldFont = require('./signika-bold.otf'); // eslint-disable-line

export class FontService {
  private static DB_NAME = 'font';
  private static DB_TABLE = 'fontData';
  private static DB_KEY = 'fontName';

  async saveFromPath(path: string) {
    const buffer = await (await fetch(path)).arrayBuffer();
    this.saveBuffer(buffer);
  }

  saveBuffer(buffer: ArrayBuffer): Promise<{ fontName: string, font: Font }> {
    return new Promise((resolve, reject) => {
      this.database()
        .then((db) => {
          const font = parse(buffer);
          const fontName = font.names.fullName.en;
          const transaction = db.transaction([FontService.DB_TABLE], 'readwrite');
          const objectStore = transaction.objectStore(FontService.DB_TABLE);
          objectStore.add({ fontName, data: buffer });
          resolve({ fontName, font });
        })
        .catch((e) => {
          console.warn('font could not be saved');
          reject(e);
        });
    });
  }

  async listFonts(): Promise<string[]> {
    return new Promise((resolve) => {
      this.database().then((db) => {
        const transaction = db.transaction(FontService.DB_TABLE);
        const objectStore = transaction.objectStore(FontService.DB_TABLE);
        const getRequest = objectStore.getAllKeys();
        getRequest.addEventListener('success', event => {
          const list = (event.target as unknown as { result: string[] }).result;
          resolve(list);
        });
      }).catch(() => {
        console.warn('fonts could not be loaded');
        resolve([]);
      });
    });
  }

  async get(fontName: string): Promise<Font> {
    return new Promise((resolve) => {
      this.database().then((db) => {
        const transaction = db.transaction(FontService.DB_TABLE);
        const objectStore = transaction.objectStore(FontService.DB_TABLE);
        const getRequest = objectStore.get(fontName);
        getRequest.addEventListener('success', (event) => {
          const data = (event.target as unknown as { result: { data: string } }).result?.data;
          resolve(parse(data));
        });
      }).catch(async () => {
        console.warn(`font ${fontName} could not be loaded use default`);
        const data = await (await fetch(SignikaBoldFont)).arrayBuffer();
        resolve(parse(data));
      });
    });
  }

  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbOpenEvent = window.indexedDB.open(FontService.DB_NAME, 1);
      dbOpenEvent.addEventListener('upgradeneeded', (event: Event) => {
        const db = (event.target as unknown as { result: IDBDatabase }).result;
        if (!db.objectStoreNames.contains(FontService.DB_TABLE)) {
          db.createObjectStore(FontService.DB_TABLE, {
            autoIncrement: false,
            keyPath: FontService.DB_KEY,
          });
        }
      });
      dbOpenEvent.addEventListener('success', (event: Event) => {
        const db = (event.target as unknown as { result: IDBDatabase }).result;
        resolve(db);
      });
      dbOpenEvent.addEventListener('error', (event: Event) => {
        reject(event);
      });
    });
  }
}

export const fontService = new FontService();
