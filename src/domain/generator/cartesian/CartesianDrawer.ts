import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';

export interface CartesianConfig {
  color: Color;
  strokeWidth: (n: number, items: number) => number;
  items: number;
  x: number;
  xDistance: (n: number, items: number) => number;
  yDistance: (n: number, items: number) => number;
}

export function draw(
  config: CartesianConfig,
  grid: Point[],
): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p) => {
      const coordinates = calculatePolarGrid(
        p,
        config.items,
        config.x,
        config.xDistance,
        config.yDistance,
      );
      const svg = coordinates
        .map((coordinate: Point, j: number) => {
          const rightIndex = j + 1;
          const downIndex = j + config.x;
          const rightLine =
            rightIndex % config.x !== 0 && rightIndex < config.items
              ? drawLine(coordinate, coordinates[rightIndex], config, j * 2)
              : '';
          const downLine =
            downIndex < config.items
              ? drawLine(coordinate, coordinates[downIndex], config, j * 2 + 1)
              : '';
          return rightLine + downLine;
        })
        .join('');
      return {
        svg: agg.svg + svg,
        points: [...agg.points, ...coordinates],
      };
    },
    { svg: '', points: [] as Point[] },
  );
}

function calculatePolarGrid(
  origin: Point,
  items: number,
  x: number,
  xDistance: (n: number, items: number) => number,
  yDistance: (n: number, items: number) => number,
): Point[] {
  const grid = [] as Point[];
  for (let i = 0; i < items; i++) {
    const calcX = i % x;
    const calcY = Math.floor(i / x);
    grid.push([
      origin[Point.X] + calcX * xDistance(calcX, x),
      origin[Point.Y] + calcY * yDistance(calcY, Math.floor(items / x)),
    ]);
  }
  return grid;
}

function drawLine(
  from: Point,
  to: Point,
  config: CartesianConfig,
  i: number,
) {
  return `<line
      x1="${from[Point.X]}"
      y1="${from[Point.Y]}"
      x2="${to[Point.X]}"
      y2="${to[Point.Y]}"
      stroke="${config.color.toString(i)}"
      stroke-width="${config.strokeWidth(i, config.items)}"
      vector-effect="non-scaling-stroke"
    />`;
}
