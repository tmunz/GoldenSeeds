import { DEFAULT_DISTRIBUTION, DISTRIBUTION_FIELDS, ProbabilityDistribution } from '../../../datatypes/ProbabilityDistribution';
import { StageItemState } from './StageItemState';

export class DistributionState implements StageItemState<ProbabilityDistribution, ProbabilityDistribution> {
  private value = { ...DEFAULT_DISTRIBUTION };
  private text = JSON.stringify(this.value);
  private valid = true;

  getValue(): ProbabilityDistribution { return this.value; }
  getTextValue(): string { return this.text; }
  isValid(): boolean { return this.valid; }

  setValue(value: ProbabilityDistribution): void {
    this.text = JSON.stringify(value);
    this.valid = DISTRIBUTION_FIELDS.every((field) => Number.isFinite(value[field]) && value[field] >= 0 && (field === 'seed' || value[field] <= 1));
    if (this.valid) {
      this.value = { ...value };
    }
  }

  async setTextValue(text: string): Promise<void> {
    try {
      const value = JSON.parse(text);
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Expected distribution parameters');
      }
      this.setValue({ ...DEFAULT_DISTRIBUTION, ...value });
    } catch {
      this.valid = false;
    }
    this.text = text;
  }
}
