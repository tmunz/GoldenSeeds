import { randomInt } from "./Random";

describe('randomInt', () => {
  test('0 to 1 with no seeed', () => {
    const result = randomInt(0, 1);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
  test('-100 to 100 with no seeed', () => {
    const result = randomInt(-100, 100);
    expect(result).toBeGreaterThanOrEqual(-100);
    expect(result).toBeLessThanOrEqual(100);
  });
  test('0 to 1 with seeed', () => {
    const result = randomInt(0, 1);
    expect(result).toBe(0);
  });
  test('-100 to 100 with seeed', () => {
    const result = randomInt(-100, 100, 42);
    expect(result).toBe(87);
  });
});