import { Color } from '../../../datatypes/Color';

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
  grid: number[][],
): { svg: string, points: number[][] } {
  return grid.reduce(
    (agg, p) => {
      const coordinates = calculatePolarGrid(p, config.items, config.x, config.xDistance, config.yDistance);
      const svg = coordinates.map((coordinate: number[], j: number) => {
        const rightIndex = j + 1;
        const downIndex = j + config.x;
        const rightLine = rightIndex % config.x !== 0 && rightIndex < config.items ? drawLine(
          coordinate, coordinates[rightIndex], config, j * 2) : '';
        const downLine = downIndex < config.items ? drawLine(
          coordinate, coordinates[downIndex], config, j * 2 + 1) : '';
        return rightLine + downLine;
      }).join('');
      return {
        svg: agg.svg + svg,
        points: [...agg.points, ...coordinates],
      };
    },
    { svg: '', points: [] as number[][] },
  );
}

function calculatePolarGrid(
  origin: number[],
  items: number,
  x: number,
  xDistance: (n: number, items: number) => number,
  yDistance: (n: number, items: number) => number,
): number[][] {
  const grid = [];
  for (let i = 0; i < items; i++) {
    const calcX = i % x;
    const calcY = Math.floor(i / x);
    grid.push([
      origin[0] + (calcX * xDistance(calcX, x)), 
      origin[1] + (calcY * yDistance(calcY, Math.floor(items / x)))
    ]);
  }
  return grid;
}

function drawLine(from: number[], to: number[], config: CartesianConfig, i: number) {
  return `<line
      x1="${from[0]}"
      y1="${from[1]}"
      x2="${to[0]}"
      y2="${to[1]}"
      stroke="${config.color.toString(i)}"
      stroke-width="${config.strokeWidth(i, config.items)}"
      vector-effect="non-scaling-stroke"
    />`
}
