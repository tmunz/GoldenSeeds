import { Color } from '../../../datatypes/Color';
import { StageItemState } from './StageItemState';

export class ColorState implements StageItemState<Color, Color> {

  private color: Color | null = null;

  getValue(): Color {
    return this.color ?? new Color();
  }

  setValue(c: Color): void {
    this.color = c;
  }

  getTextValue(): string {
    return this.color?.getAcn() ?? 'none';
  }

  async setTextValue(s: string): Promise<void> {
    if (this.color === null) {
      this.color = new Color();
    }
    this.color.setValue(s);
  }

  isValid(): boolean {
    return this.color?.isValid() ?? false;
  }
}
