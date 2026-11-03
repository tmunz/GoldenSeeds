import { Font, parse } from 'opentype.js';
import { openDatabase } from '../../utils/IndexedDb';

const SignikaBoldFont = require('./signika-bold.otf'); // eslint-disable-line

export class FontService {
  private static DB_NAME = 'font';
  private static DB_TABLE = 'fontData';
  private static DB_KEY = 'fontName';

  async saveBuffer(buffer: ArrayBuffer): Promise<{ fontName: string, font: Font }> {
    const font = parse(buffer);
    const fontName = font.names.fullName.en;
    const db = await this.database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FontService.DB_TABLE], 'readwrite');
      transaction.addEventListener('complete', () => resolve({ fontName, font }));
      transaction.addEventListener('abort', () => reject(transaction.error ?? new Error('Font save aborted')));
      transaction.addEventListener('error', () => reject(transaction.error ?? new Error('Font save failed')));
      transaction.objectStore(FontService.DB_TABLE).put({ fontName, data: buffer });
    });
  }

  async listFonts(): Promise<string[]> {
    try {
      const db = await this.database();
      return await new Promise<string[]>((resolve, reject) => {
        const request = db.transaction(FontService.DB_TABLE).objectStore(FontService.DB_TABLE).getAllKeys();
        request.addEventListener('success', () => resolve(request.result as string[]));
        request.addEventListener('error', () => reject(request.error));
      });
    } catch {
      return [];
    }
  }

  async get(fontName: string): Promise<Font> {
    if (fontName) {
      try {
        const db = await this.database();
        const record = await new Promise<{ data: ArrayBuffer } | undefined>((resolve, reject) => {
          const request = db.transaction(FontService.DB_TABLE).objectStore(FontService.DB_TABLE).get(fontName);
          request.addEventListener('success', () => resolve(request.result));
          request.addEventListener('error', () => reject(request.error));
        });
        if (record?.data instanceof ArrayBuffer) {
          return parse(record.data);
        }
      } catch { /* Missing, unreadable, or invalid stored fonts use the bundled default. */ }
    }
    return parse(await this.defaultFontBuffer());
  }

  /** Makes the bundled default font selectable alongside user-provided fonts. */
  async installDefaultFont(): Promise<void> {
    await this.saveBuffer(await this.defaultFontBuffer());
  }

  private async defaultFontBuffer(): Promise<ArrayBuffer> {
    const response = await fetch(SignikaBoldFont);
    if (!response.ok) { throw new Error('Default font could not be loaded'); }
    return response.arrayBuffer();
  }

  private database(): Promise<IDBDatabase> {
    return openDatabase(FontService.DB_NAME, 1, (db) => {
      if (!db.objectStoreNames.contains(FontService.DB_TABLE)) {
        db.createObjectStore(FontService.DB_TABLE, {
          autoIncrement: false,
          keyPath: FontService.DB_KEY,
        });
      }
    });
  }
}

export const fontService = new FontService();
