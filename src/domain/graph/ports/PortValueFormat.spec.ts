import { formatPortValue } from './PortValueFormat';
import { DEFAULT_DISTRIBUTION } from '../../../datatypes/ProbabilityDistribution';

test.each([
  [1.23456789, '1.23'], [1.239, '1.24'], [2, '2'], [2.5, '2.5'], [-0.001, '0'],
])('limits numeric previews to two decimal places: %s', (value, expected) => {
  expect(formatPortValue({ type: 'number', value })).toBe(expected);
});

test('rounds bounding box dimensions for display without changing the bounds', () => {
  const value = { min: [-0.123456, -1.234567], max: [10, 20] };
  expect(formatPortValue({ type: 'boundingBox', value })).toBe('10.12×21.23');
  expect(value.min).toEqual([-0.123456, -1.234567]);
});

test('uses the same precision for expression and distribution previews', () => {
  expect(formatPortValue({ type: 'expression', value: n => (n + 1) / 3 })).toBe('0.33, 0.67, 1, ...');
  expect(formatPortValue({ type: 'distribution', value: { ...DEFAULT_DISTRIBUTION, sigma: 0.123456, seed: 42 } })).toBe('σ 0.12, seed 42');
});
