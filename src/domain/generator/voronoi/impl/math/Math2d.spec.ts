import { Math2d } from './Math2d';

describe('angleAt', () => {
  test('calculates point on straight line correct', () => {
    const rads = Math2d.angleAt({ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 });
    expect(rads).toBeCloseTo(Math.PI);
  });
  test('calculates point at right angle correct', () => {
    const rads = Math2d.angleAt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(Math.PI / 2);
  });
  test('calculates point at right angle in opposite direction correct', () => {
    const rads = Math2d.angleAt({ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(Math.PI / 2);
  });
  test('calculates point at 45° correct', () => {
    const rads = Math2d.angleAt({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(Math.PI / 4);
  });
  test('calculates 0° angles correct', () => {
    const rads = Math2d.angleAt({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(0);
  });
});

describe('distanceBetween', () => {
  test('calculates same point correct', () => {
    const rads = Math2d.distanceBetween({ x: 1, y: 1 }, { x: 1, y: 1 });
    expect(rads).toBeCloseTo(0);
  });
  test('calculates in x direction correct', () => {
    const rads = Math2d.distanceBetween({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(rads).toBeCloseTo(1);
  });
  test('calculates in y direction correct', () => {
    const rads = Math2d.distanceBetween({ x: 0, y: 0 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(1);
  });
  test('calculates in in both directions correct', () => {
    const rads = Math2d.distanceBetween({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(rads).toBeCloseTo(5);
  });
  test('calculates in in both directions reverse correct', () => {
    const rads = Math2d.distanceBetween({ x: 3, y: 4 }, { x: 0, y: 0 });
    expect(rads).toBeCloseTo(5);
  });
});

describe('triangleSideB', () => {
  test('calculates side for a right scalene triangle correct', () => {
    const b = Math2d.triangleSideB(3, 0.6435, Math.PI / 2);
    expect(b).toBeCloseTo(5);
  });
  test('calculates side for a unspecific triangle correct', () => {
    const b = Math2d.triangleSideB(2, 1, 2);
    expect(b).toBeCloseTo(2.16121);
  });
});

describe('triangleSideC', () => {
  test('calculates side for a right scalene triangle correct', () => {
    const c = Math2d.triangleSideC(3, 0.54035, Math.PI / 2);
    expect(c).toBeCloseTo(5);
  });
  test('calculates side for a unspecific triangle correct', () => {
    const c = Math2d.triangleSideC(1, Math.PI / 6, Math.PI / 3);
    expect(c).toBeCloseTo(2);
  });
});

describe('slope', () => {
  test('calculates slope for points parallel to x-axis correct', () => {
    const rads = Math2d.slope({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(rads).toBeCloseTo(0);
  });
  test('calculates slope for points parallel to y-axis (positive) correct', () => {
    const rads = Math2d.slope({ x: 0, y: 0 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(Infinity);
  });
  test('calculates slope for points parallel to y-axis (nevative) correct', () => {
    const rads = Math2d.slope({ x: 0, y: 0 }, { x: 0, y: -1 });
    expect(rads).toBeCloseTo(-Infinity);
  });
  test('calculates slope for unspecific original points (positive) correct', () => {
    const rads = Math2d.slope({ x: 0, y: 0 }, { x: 2, y: 1 });
    expect(rads).toBeCloseTo(0.5);
  });
  test('calculates slope for unspecific original points (negative) correct', () => {
    const rads = Math2d.slope({ x: 0, y: 0 }, { x: -2, y: 1 });
    expect(rads).toBeCloseTo(-0.5);
  });
  test('calculates slope for unspecific points correct', () => {
    const rads = Math2d.slope({ x: 2, y: 4 }, { x: 0, y: 8 });
    expect(rads).toBeCloseTo(-2);
  });
});

describe('slopeAngle', () => {
  test('calculates slopeAngle for points parallel to x-axis (positive) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(rads).toBeCloseTo(0);
  });
  test('calculates slopeAngle for points parallel to x-axis (negative) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: -1, y: 0 });
    expect(rads).toBeCloseTo(Math.PI);
  });
  test('calculates slopeAngle for points parallel to y-axis (positive) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: 0, y: 1 });
    expect(rads).toBeCloseTo(Math.PI / 2);
  });
  test('calculates slopeAngle for points parallel to y-axis (nevative) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: 0, y: -1 });
    expect(rads).toBeCloseTo((Math.PI * 3) / 2);
  });
  test('calculates slopeAngle for unspecific original points (+x, +y) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: 2, y: 1 });
    expect(rads).toBeCloseTo(0.4636);
  });
  test('calculates slopeAngle for unspecific original points (-x, +y) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: -2, y: 1 });
    expect(rads).toBeCloseTo(Math.PI - 0.4636);
  });
  test('calculates slopeAngle for unspecific original points (-x, -y) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: -2, y: -1 });
    expect(rads).toBeCloseTo(Math.PI + 0.4636);
  });
  test('calculates slopeAngle for unspecific original points (+x, -y) correct', () => {
    const rads = Math2d.slopeAngle({ x: 0, y: 0 }, { x: 2, y: -1 });
    expect(rads).toBeCloseTo(2 * Math.PI - 0.4636);
  });
  test('calculates slopeAngle for unspecific points correct', () => {
    const rads = Math2d.slopeAngle({ x: 1, y: 3 }, { x: 0, y: 4 });
    expect(rads).toBeCloseTo((Math.PI * 3) / 4);
  });
});

describe('calculatePointWithAngleAndDistance', () => {
  test('calculates distance for base parallel to x-axis (positive) correct', () => {
    const p = Math2d.calculatePointWithAngleAndDistance({ x: 0, y: 0 }, { x: 1, y: 0 }, 0.4637339, Math.sqrt(5));
    expect(p.x).toBeCloseTo(2);
    expect(p.y).toBeCloseTo(1);
  });
  test('calculates distance for base parallel to x-axis (negative) correct', () => {
    const p = Math2d.calculatePointWithAngleAndDistance({ x: 0, y: 0 }, { x: -1, y: 0 }, 0.4637339, Math.sqrt(5));
    expect(p.x).toBeCloseTo(-2);
    expect(p.y).toBeCloseTo(-1);
  });
  test('calculates distance for base parallel to y-axis (poitive) correct', () => {
    const p = Math2d.calculatePointWithAngleAndDistance({ x: 0, y: 0 }, { x: 0, y: 1 }, 0.4637339, Math.sqrt(5));
    expect(p.x).toBeCloseTo(-1);
    expect(p.y).toBeCloseTo(2);
  });
  test('calculates distance for base parallel to y-axis (negative) correct', () => {
    const p = Math2d.calculatePointWithAngleAndDistance({ x: 0, y: 0 }, { x: 0, y: -1 }, 0.4637339, Math.sqrt(5));
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(-2);
  });
  test('calculates distance for unspecific original positioning correct', () => {
    const p = Math2d.calculatePointWithAngleAndDistance({ x: 0, y: 0 }, { x: 1, y: 2 }, 0.4637339, 2);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(2);
  });
  test('calculates distance for unspecific positioning correct', () => {
    const p = Math2d.calculatePointWithAngleAndDistance({ x: 6, y: 6 }, { x: 7, y: 7 }, Math.PI / 4, 1);
    expect(p.x).toBeCloseTo(6);
    expect(p.y).toBeCloseTo(7);
  });
});
