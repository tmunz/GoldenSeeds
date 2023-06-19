import { StageItemState } from './StageItemState';

export class NumberState implements StageItemState<number, number> {

  private n: number | null = null;

  getValue(): number {
    return this.n ?? 0;
  }

  setValue(n: number): void {
    this.n = n;
  }

  getTextValue(): string {
    return this.n !== null && this.isValid() ? this.n.toString() : '';
  }

  async setTextValue(s: string): Promise<void> {
    this.n = Number.parseFloat(s);
  }

  isValid(): boolean {
    return this.n !== null && isFinite(this.n) ? true : false;
  }
}
