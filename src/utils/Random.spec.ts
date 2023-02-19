import { randomInt, random } from './Random';

describe('randomInt', () => {
  test('0 to 1 with no seeed', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(0, 1);
      expect(Math.abs(result % 1)).toBe(0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    }
  });
  test('-100 to 100 with no seeed', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(-100, 100);
      expect(Math.abs(result % 1)).toBe(0);
      expect(result).toBeGreaterThanOrEqual(-100);
      expect(result).toBeLessThanOrEqual(100);
    }
  });
  test('0 to 1 with seeed', () => {
    const result = randomInt(0, 1, 42);
    expect(Math.abs(result % 1)).toBe(0);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
    for (let i = 0; i < 100; i++) {
      expect(result).toBe(randomInt(0, 1, 42));
    }
  });
  test('-100 to 100 with seeed', () => {
    const result = randomInt(-100, 100, 42);
    expect(Math.abs(result % 1)).toBe(0);
    expect(result).toBeGreaterThanOrEqual(-100);
    expect(result).toBeLessThanOrEqual(100);
    for (let i = 0; i < 100; i++) {
      expect(result).toBe(randomInt(-100, 100, 42));
    }
  });
});

describe('random', () => {
  test('0 to 1 with no seeed', () => {
    for (let i = 0; i < 100; i++) {
      const result = random(0, 1);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    }
  });
  test('-100 to 100 with no seeed', () => {
    for (let i = 0; i < 100; i++) {
      const result = random(-100, 100);
      expect(result).toBeGreaterThanOrEqual(-100);
      expect(result).toBeLessThanOrEqual(100);
    }
  });
  test('0 to 1 with seeed', () => {
    const result = random(0, 1, 42);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
    for (let i = 0; i < 100; i++) {
      expect(result).toBe(random(0, 1, 42));
    }
  });
  test('-100 to 100 with seeed', () => {
    const result = random(-100, 100, 42);
    expect(result).toBeGreaterThanOrEqual(-100);
    expect(result).toBeLessThanOrEqual(100);
    for (let i = 0; i < 100; i++) {
      expect(result).toBe(random(-100, 100, 42));
    }
  });
});
