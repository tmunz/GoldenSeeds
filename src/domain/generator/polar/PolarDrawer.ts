import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';

export interface PolarConfig {
  color: Color;
  strokeWidth: (n: number, items: number) => number;
  items: number;
  angle: (n: number, items: number) => number;
  distance: (n: number, items: number) => number;
}

export function draw(config: PolarConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p) => {
      const coordinates = calculatePolarGrid(p, config.items, config.angle, config.distance);
      const svg = coordinates
        .map(
          (coordinate: Point, j: number) =>
            `<line
        x1="${p[Point.X]}"
        y1="${p[Point.Y]}"
        x2="${coordinate[Point.X]}"
        y2="${coordinate[Point.Y]}"
        stroke="${config.color.toString(j)}"
        stroke-width="${config.strokeWidth(j, config.items)}"
        vector-effect="non-scaling-stroke"
      />`,
        )
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
  center: Point,
  items: number,
  angle: (n: number, items: number) => number,
  distance: (n: number, items: number) => number,
): Point[] {
  const grid = [];
  for (let n = 1; n <= items; n++) {
    const rad = (angle(n, items) / 180) * Math.PI;
    grid.push([Math.cos(rad), Math.sin(rad)].map((trig, i) => center[i] + distance(n, items) * trig));
  }
  return grid;
}
