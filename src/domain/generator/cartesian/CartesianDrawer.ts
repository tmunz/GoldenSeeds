import { Color } from '../../../datatypes/Color';

export interface CartesianConfig {
  color: Color;
  strokeWidth: (n: number, items: number) => number;
  items: number;
  x: number;
}

export function draw(
  config: CartesianConfig,
  grid: number[][],
): { svg: string, points: number[][] } {
  return grid.reduce(
    (agg, p) => {
      const coordinates = calculatePolarGrid(config.items, config.x);
      const svg = coordinates.map((coordinate: number[], j: number) => {
        const rightIndex = j + 1;
        const downIndex = j + config.x;
        const rightLine = rightIndex % config.x !== 0 && rightIndex < config.items ? drawLine(
          [p[0] + coordinate[0], p[1] + coordinate[1]],
          [p[0] + coordinates[rightIndex][0], p[1] + coordinates[rightIndex][1]],
          config, j * 2) : '';
        const downLine = downIndex < config.items ? drawLine(
          [p[0] + coordinate[0], p[1] + coordinate[1]],
          [p[0] + coordinates[downIndex][0], p[1] + coordinates[downIndex][1]],
          config, j * 2 + 1) : '';
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
  items: number,
  x: number,
): number[][] {
  const grid = [];
  for (let i = 0; i < items; i++) {
    grid.push([i % x, Math.floor(i / x)]);
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
