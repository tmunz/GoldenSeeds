import { Font } from 'opentype.js';
import { StageItemState } from './StageItemState';
import { fontService } from '../../font/FontService';

export class FontState implements StageItemState<Font, Font> {

  private font: Font | null = null;

  getValue(): Font {
    return this.font!; // TODO
  }

  setValue(font: Font): void {
    this.font = font;
  }

  getTextValue(): string {
    return this.font?.names.fullName.en ?? '';
  }

  async setTextValue(s: string): Promise<void> {
    this.font = await fontService.get(s);
  }

  isValid(): boolean {
    return this.font ? true : false;
  }
}
