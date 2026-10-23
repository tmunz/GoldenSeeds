export interface ProbabilityDistribution {
  muRandomness: number;
  sigma: number;
  sigmaRandomness: number;
  noise: number;
  seed: number;
}

export const DEFAULT_DISTRIBUTION: ProbabilityDistribution = {
  muRandomness: 0, sigma: 0, sigmaRandomness: 0, noise: 0, seed: 999,
};

export const DISTRIBUTION_FIELDS = Object.keys(DEFAULT_DISTRIBUTION) as (keyof ProbabilityDistribution)[];
export const DEFAULT_DISTRIBUTION_TEXT = JSON.stringify(DEFAULT_DISTRIBUTION);
