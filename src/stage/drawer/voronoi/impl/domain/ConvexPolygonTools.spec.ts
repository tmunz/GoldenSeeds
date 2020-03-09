import { ConvexPolygonTools } from './ConvexPolygonTools';
import { Math2d } from '../math/Math2d';

describe('offsetPath', () => {
  test('calculates simple rectangle with no offset correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.offsetPath(path, 0)).pathToBeCloseTo(path);
  });
  test('calculates simple rectangle with small offset correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    const expected = [{ x: 2, y: 2 }, { x: 2, y: 8 }, { x: 8, y: 8 }, { x: 8, y: 2 }];
    expect(ConvexPolygonTools.offsetPath(path, 2)).pathToBeCloseTo(expected);
  });
  test('calculates trianlge with acute angle correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 8 }];
    const expected = [{ x: 2, y: 2 }, { x: 4.2984, y: 2 }, { x: 2, y: 3.8387 }];
    expect(ConvexPolygonTools.offsetPath(path, 2)).pathToBeCloseTo(expected);
  });
  test('calculates overlapping correct (no intersections after offset) for 90°/45° angle polygon', () => {
    const path = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 1, y: 5 }, { x: 0, y: 5 }];
    const expected = [{ x: 1, y: 1 }, { x: 3.58578, y: 1 }, { x: 1, y: 3.58578}];

    const offsetPath = ConvexPolygonTools.offsetPath(path, 1);
    expect(Math2d.angleAt(offsetPath[1], offsetPath[0], offsetPath[2])).toBeCloseTo(Math2d.angleAt(path[1], path[0], path[2]));
    expect(Math2d.angleAt(offsetPath[0], offsetPath[1], offsetPath[2])).toBeCloseTo(Math2d.angleAt(path[0], path[1], path[3]));
    expect(offsetPath).pathToBeCloseTo(expected);
  
  });
  test('calculates overlapping correct (no intersections after offset) for 90°/unspecific polygon', () => {
    const path = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 1, y: 10 }, { x: 0, y: 10 }];
    const expected = [{ x: 1.5, y: 1.5 }, { x: 3.5729, y: 1.5 }, { x: 1.5, y: 5.6458}];

    const offsetPath = ConvexPolygonTools.offsetPath(path, 1.5);
    expect(Math2d.angleAt(offsetPath[1], offsetPath[0], offsetPath[2])).toBeCloseTo(Math2d.angleAt(path[1], path[0], path[2]));
    expect(Math2d.angleAt(offsetPath[0], offsetPath[1], offsetPath[2])).toBeCloseTo(Math2d.angleAt(path[0], path[1], path[3]));
    expect(offsetPath).pathToBeCloseTo(expected);
  });
});

describe('isCounterclockwise', () => {
  test('calculates empty correct', () => {
    const path: Point[] = [];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(true);
  });
  test('calculates single Point correct', () => {
    const path = [{ x: 0, y: 0 }];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(true);
  });
  test('calculates two Point correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(true);
  });
  test('calculates simple counterclockwise rectangle correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(true);
  });
  test('calculates simple clockwise rectangle correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(false);
  });
  test('calculates counterclockwise polygon correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 20 }, { x: 0, y: 10 }];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(true);
  });
  test('calculates clockwise polygon correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 5, y: 20 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.isCounterclockwise(path)).toBe(false);
  });
});

describe('signedArea', () => {
  test('calculates empty correct', () => {
    const path: Point[] = [];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(0);
  });
  test('calculates single Point correct', () => {
    const path = [{ x: 0, y: 0 }];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(0);
  });
  test('calculates two Point correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(0);
  });
  test('calculates simple counterclockwise rectangle correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(100);
  });
  test('calculates simple clockwise rectangle correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(-100);
  });
  test('calculates counterclockwise polygon correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 20 }, { x: 0, y: 10 }];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(150);
  });
  test('calculates clockwise polygon correct', () => {
    const path = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 5, y: 20 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(ConvexPolygonTools.signedArea(path)).toBeCloseTo(-150);
  });
});
