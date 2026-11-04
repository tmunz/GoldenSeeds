import { ParameterState } from './ParameterState';

function isPoint(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every(coordinate => typeof coordinate === 'number' && Number.isFinite(coordinate));
}

/** Accept both a JSON array of points and the shorthand "[x, y], [x, y]". */
export class PointsState implements ParameterState<number[][], number[][]> {
  private value: number[][] = [];
  private text = '[]';
  private valid = true;

  getValue(): number[][] { return this.value; }
  getTextValue(): string { return this.text; }
  isValid(): boolean { return this.valid; }

  setValue(value: number[][]): void {
    this.valid = Array.isArray(value) && value.every(isPoint);
    if (this.valid) {
      this.value = value.map(point => [...point]);
      this.text = JSON.stringify(this.value);
    }
  }

  setText(text: string): void {
    try {
      let value: unknown;
      try { value = JSON.parse(text); }
      catch { value = JSON.parse(`[${text}]`); }
      if (isPoint(value)) { value = [value]; }
      if (!Array.isArray(value) || !value.every(isPoint) || !text.trim().startsWith('[')) {
        throw new Error('Expected an array of finite coordinate pairs');
      }
      this.setValue(value);
    } catch {
      this.valid = false;
    }
    this.text = text;
  }

  async setTextValue(text: string): Promise<void> { this.setText(text); }
}
