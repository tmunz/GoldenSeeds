import { Voronoi } from './Voronoi';
import { Boundary } from './domain/Boundary';

describe('Voronoi', () => {
  test('2x2 grid cells', () => {
    const voronoi = new Voronoi([[0, 0], [1, 0], [0, 1], [1, 1]], new Boundary({ x: 0, y: 0, w: 1, h: 1 }), 0.1);

    const expectedCells = [
      { center: { x: 1, y: 1 }, path: [{ x: 0.6, y: 0.6 }, { x: 0.7586, y: 0.6 }, { x: 0.6, y: 0.7586 }] },
      { center: { x: 0, y: 1 }, path: [{ x: 0.4, y: 0.7586 }, { x: 0.2414, y: 0.6 }, { x: 0.4, y: 0.6 }] },
      { center: { x: 1, y: 0 }, path: [{ x: 0.6, y: 0.2414 }, { x: 0.7586, y: 0.4 }, { x: 0.6, y: 0.4 }] },
      { center: { x: 0, y: 0 }, path: [{ x: 0.2414, y: 0.4 }, { x: 0.4, y: 0.2414 }, { x: 0.4, y: 0.4 }] }
    ];

    voronoi.cells.forEach((cell, i) => {
      expect(cell.path).pathToBeCloseTo(expectedCells[i].path);
      expect(cell.center).pointToBeCloseTo(expectedCells[i].center);
    });
  });

  test('2x2 grid edges', () => {
    const voronoi = new Voronoi([[0, 0], [1, 0], [0, 1], [1, 1]], new Boundary({ x: 0, y: 0, w: 1, h: 1 }), 0.1);

    const expectedEdges = [
      { a: { x: 0.5, y: 0.5 }, b: { x: 0.5, y: 0 } },
      { a: { x: 0.5, y: 0.5 }, b: { x: 0, y: 0.5 } },
      { a: { x: 0.5, y: 0.5 }, b: { x: 1, y: 0.5 } },
      { a: { x: 0.5, y: 0.5 }, b: { x: 0.5, y: 1 } },
      { a: { x: 1, y: 0.5 }, b: { x: 0.5, y: 1 } },
      { a: { x: 0.5, y: 1 }, b: { x: 0, y: 0.5 } },
      { a: { x: 0.5, y: 0 }, b: { x: 1, y: 0.5 } },
      { a: { x: 0, y: 0.5 }, b: { x: 0.5, y: 0 } },
    ];

    voronoi.edges.forEach((edge, i) => {
      expect(edge.a).pointToBeCloseTo(expectedEdges[i].a);
      expect(edge.b).pointToBeCloseTo(expectedEdges[i].b);
    });
  });

  test('2x2 grid vertices', () => {
    const voronoi = new Voronoi([[0, 0], [1, 0], [0, 1], [1, 1]], new Boundary({ x: 0, y: 0, w: 1, h: 1 }), 0.1);

    const expectedVertices = [
      { x: 0.5, y: 0.5 }, { x: 0.5, y: 0 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, { x: 0.5, y: 1 },
    ];

    voronoi.vertices.forEach((vertex, i) => {
      expect(vertex).pointToBeCloseTo(expectedVertices[i]);
    });
  });
});
