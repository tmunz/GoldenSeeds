import { Font } from 'opentype.js';
import { ParameterState } from './ParameterState';
import { fontService } from '../font/FontService';

export class FontState implements ParameterState<Font, Font> {

  private font: Font | null = null;

  getValue(): Font {
    if (!this.font) { throw new Error('Font has not been loaded'); }
    return this.font;
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
    return this.font !== null;
  }
}
