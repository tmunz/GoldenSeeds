import type { ParamDefinition } from '../domain/generator/SvgGenerator';

export interface ProbabilityDistribution {
  muRandomness: number;
  sigma: number;
  sigmaRandomness: number;
  noise: number;
  seed: number;
}

const probability = {
  type: 'number' as const, initial: '0', min: 0, max: 1, step: 0.05,
  validate: (value: number) => value >= 0 && value <= 1,
};

export const DISTRIBUTION_DEFINITION: Record<keyof ProbabilityDistribution, Extract<ParamDefinition, { type: 'number' }>> = {
  muRandomness: probability,
  sigma: probability,
  sigmaRandomness: probability,
  noise: probability,
  seed: { type: 'number', initial: '999', min: 0, max: 999, step: 1, validate: (value) => value >= 0 },
};
export const DISTRIBUTION_FIELDS = Object.keys(DISTRIBUTION_DEFINITION) as (keyof ProbabilityDistribution)[];
export const DEFAULT_DISTRIBUTION = DISTRIBUTION_FIELDS.reduce((values, field) => {
  values[field] = Number(DISTRIBUTION_DEFINITION[field].initial);
  return values;
}, {} as ProbabilityDistribution);
export const DEFAULT_DISTRIBUTION_TEXT = JSON.stringify(DEFAULT_DISTRIBUTION);

export function isDistributionFieldValue(field: keyof ProbabilityDistribution, value: number): boolean {
  return Number.isFinite(value) && (DISTRIBUTION_DEFINITION[field].validate?.(value) ?? true);
}
