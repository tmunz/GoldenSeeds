import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';

export interface FunctionConfig {
  color: Color;
  strokeWidth: (n: number, items: number) => number;
  items: number;
  functionX: (n: number, items: number) => number | number[];
  functionY: (n: number, items: number) => number | number[];
}

export function draw(config: FunctionConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p, j) => {
      const coordinates = calculateFunctionGrid(p, config.items, config.functionX, config.functionY);
      const svg = `<path 
        fill="none"
        stroke="${config.color.toString(j)}"
        stroke-width="${config.strokeWidth(j, config.items)}"
        vector-effect="non-scaling-stroke"
        d="${
        coordinates.reduce((s: string, point: Point, i: number) => {
          if (i === 0) {
            return `M ${point[Point.X]}, ${point[Point.Y]} `;
          } else {
            return `${s} L ${point[Point.X]}, ${point[Point.Y]} `;
          }
        }, '')
        }" />`;
      return {
        svg: agg.svg + svg,
        points: [...agg.points, ...coordinates],
      };
    },
    { svg: '', points: [] as Point[] },
  );
}

function calculateFunctionGrid(
  center: Point,
  items: number,
  funX: (n: number, items: number) => number | number[],
  funY: (n: number, items: number) => number | number[],
): Point[] {
  const grid = [];
  for (let n = 1; n <= items; n++) {
    let x = funX(n, items);
    let y = funY(n, items);
    if (Array.isArray(x)) {
      x = x[n-1] ?? 0;
    }
    if (Array.isArray(y)) {
      y = y[n-1] ?? 0;
    }
    grid.push([center[Point.X] + x, center[Point.Y] - y]);
  }
  return grid;
}
