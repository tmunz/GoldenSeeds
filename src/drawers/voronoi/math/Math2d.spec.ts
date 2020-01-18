import { Math2d } from "./Math2d";

describe('angleAt', () => {
  test('should return PI (180°)', () => {
    const rads = Math2d.angleAt({x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0});
    expect(rads).toBeCloseTo(Math.PI);
  });
  test('should return PI/2 (90°)', () => {
    const rads = Math2d.angleAt({x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1});
    expect(rads).toBeCloseTo(Math.PI / 2);
  });
  test('should return PI/4 (45°)', () => {
    const rads = Math2d.angleAt({x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1});
    expect(rads).toBeCloseTo(Math.PI / 4);
  });
  test('should return 0 (0°)', () => {
    const rads = Math2d.angleAt({x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 1});
    expect(rads).toBeCloseTo(0);
  });
});
describe('distanceBetween', () => {
  
});
describe('triangleSide', () => {
  
});
describe('calculatePointWithAngleAndDistance', () => {
 
});