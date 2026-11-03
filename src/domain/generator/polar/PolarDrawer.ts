import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';
import { svgLine } from '../SvgPrimitives';

export interface PolarConfig {
  style: {
    color: Color;
    strokeWidth: (n: number, items: number) => number;
  };
  grid: {
    items: number;
    angle: (n: number, items: number) => number;
    distance: (n: number, items: number) => number;
  };
}

export function draw(config: PolarConfig, points: Point[]): { svg: string; points: Point[] } {
  return points.reduce(
    (agg, p) => {
      const coordinates = calculatePolarGrid(p, config.grid.items, config.grid.angle, config.grid.distance);
      const svg = coordinates
        .map((coordinate: Point, j: number) => svgLine(p, coordinate, config.style.color, j, config.style.strokeWidth(j, config.grid.items)))
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
  const points = [];
  for (let n = 1; n <= items; n++) {
    const rad = (angle(n, items) / 180) * Math.PI;
    points.push([Math.cos(rad), Math.sin(rad)].map((trig, i) => center[i] + distance(n, items) * trig));
  }
  return points;
}
