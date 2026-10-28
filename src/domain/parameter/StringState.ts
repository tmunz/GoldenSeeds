import { ParameterState } from './ParameterState';

export class StringState implements ParameterState<string, string> {

  private s: string | null = null;

  getValue(): string {
    return this.s ?? '';
  }

  setValue(s: string): void {
    this.s = s;
  }

  getTextValue(): string {
    return this.s && this.isValid() ? this.s : '';
  }

  async setTextValue(s: string): Promise<void> {
    this.s = s;
  }

  isValid(): boolean {
    return this.s ? true : false;
  }
}
