import { Color } from '../../../datatypes/Color';

export interface PolarConfig {
  color: Color;
  strokeWidth: (n: number, items: number) => number;
  items: number;
  angle: (n: number, items: number) => number;
  distance: (n: number, items: number) => number;
}

export function draw(
  config: PolarConfig,
  grid: number[][],
): { svg: string; points: number[][] } {
  return grid.reduce(
    (agg, p) => {
      const coordinates = calculatePolarGrid(
        p,
        config.items,
        config.angle,
        config.distance,
      );
      const svg = coordinates
        .map(
          (coordinate: number[], j: number) =>
            `<line
        x1="${p[0]}"
        y1="${p[1]}"
        x2="${coordinate[0]}"
        y2="${coordinate[1]}"
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
    { svg: '', points: [] as number[][] },
  );
}

function calculatePolarGrid(
  center: number[],
  items: number,
  angle: (n: number, items: number) => number,
  distance: (n: number, items: number) => number,
): number[][] {
  const grid = [];
  for (let n = 1; n <= items; n++) {
    const rad = (angle(n, items) / 180) * Math.PI;
    grid.push(
      [Math.cos(rad), Math.sin(rad)].map(
        (trig, i) => center[i] + distance(n, items) * trig,
      ),
    );
  }
  return grid;
}
