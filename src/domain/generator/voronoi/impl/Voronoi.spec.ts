import { Voronoi } from './Voronoi';
import { ConvexPolygonTools } from './utils/ConvexPolygonTools';

const bounds = { min: [-10, -10], max: [10, 10] };
const cases = [
  { name: 'vertical pair', points: [[0, -5], [0, 5]] },
  { name: 'horizontal pair', points: [[-5, 0], [5, 0]] },
  { name: 'vertical sites', points: [[0, -5], [0, 0], [0, 5]] },
  { name: 'horizontal sites', points: [[-5, 0], [0, 0], [5, 0]] },
  { name: 'vertical pair in a triangle', points: [[0, -5], [0, 5], [5, 0]] },
  { name: 'regular grid', points: Array.from({ length: 25 }, (_, i) => [(i % 5 - 2) * 3, (Math.floor(i / 5) - 2) * 3]) },
];

describe.each(cases)('$name', ({ points }) => {
  test.each([0, 0.1, 0.5])('calculates complete finite cells with offset %s', offset => {
    const voronoi = new Voronoi(points.map(point => [...point]), bounds, offset);
    expect(voronoi.cells.length).toBe(points.length);
    for (const cell of voronoi.cells) {
      expect(cell.path.length).toBeGreaterThanOrEqual(3);
      expect(Math.abs(ConvexPolygonTools.signedArea(cell.path))).toBeGreaterThan(0);
      for (const point of cell.path) {
        expect(point.every(Number.isFinite)).toBe(true);
        const distanceSquared = (site: number[]) => (point[0] - site[0]) ** 2 + (point[1] - site[1]) ** 2;
        for (const site of points) {
          expect(distanceSquared(cell.center)).toBeLessThanOrEqual(distanceSquared(site) + 1e-6);
        }
      }
    }
    if (offset === 0) {
      const area = voronoi.cells.reduce((sum, cell) => sum + Math.abs(ConvexPolygonTools.signedArea(cell.path)), 0);
      expect(area).toBeCloseTo(400, 6);
    }
  });
});
