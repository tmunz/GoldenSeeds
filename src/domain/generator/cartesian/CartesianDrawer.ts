import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';

export interface CartesianConfig {
  style: {
    color: Color;
    strokeWidth: (n: number, items: number) => number;
  };
  grid: {
    items: number;
    x: number;
    xOffset: number;
    yOffset: number;
    xDistance: (n: number, items: number) => number;
    yDistance: (n: number, items: number) => number;
  };
}

export function draw(config: CartesianConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p) => {
      const coordinatesRaw = calculateCartesianGrid(
        config.grid.items,
        config.grid.x,
        config.grid.xDistance,
        config.grid.yDistance,
      );
      const [minX, maxX, minY, maxY] = coordinatesRaw.reduce((agg, c) => [
        Math.min(c[Point.X], agg[0]),
        Math.max(c[Point.X], agg[1]),
        Math.min(c[Point.Y], agg[2]),
        Math.max(c[Point.Y], agg[3]),
      ], [0, 0, 0, 0]);
      const offset = [p[Point.X] + config.grid.xOffset - ((maxX - minX) / 2), p[Point.Y] + config.grid.yOffset - ((maxY - minY) / 2)];
      const coordinates = coordinatesRaw.map((c) => [c[Point.X] + offset[Point.X], c[Point.Y] + offset[Point.Y]]);
      const svg = coordinates
        .map((coordinate: Point, j: number) => {
          const rightIndex = j + 1;
          const downIndex = j + config.grid.x;
          const rightLine =
            rightIndex % config.grid.x !== 0 && rightIndex < config.grid.items
              ? drawLine(coordinate, coordinates[rightIndex], config, j * 2)
              : '';
          const downLine =
            downIndex < config.grid.items ? drawLine(coordinate, coordinates[downIndex], config, j * 2 + 1) : '';
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

function calculateCartesianGrid(
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
      calcX * xDistance(calcX, x),
      calcY * yDistance(calcY, Math.floor(items / x)),
    ]);
  }
  return grid;
}

function drawLine(from: Point, to: Point, config: CartesianConfig, i: number) {
  return `<line
      x1="${from[Point.X]}"
      y1="${from[Point.Y]}"
      x2="${to[Point.X]}"
      y2="${to[Point.Y]}"
      stroke="${config.style.color.getRgbString(i)}"
      stroke-opacity="${config.style.color.getOpacity()}"
      stroke-width="${config.style.strokeWidth(i, config.grid.items)}"
      vector-effect="non-scaling-stroke"
    />`;
}
