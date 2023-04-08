import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';

export interface TextDrawerConfig {
  style: {
    color: Color;
  },
  text: {
    content: string;
    size: number;
  },
}

export function draw(config: TextDrawerConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p) => {
      const svg = `<text
        x="${p[Point.X]}"
        y="${p[Point.Y]}"
        fill="${config.style.color.toRgbHex()}"
        fill-opacity="${config.style.color.alpha}"
      >
        ${config.text.content}
      </text>`;
      return {
        svg: agg.svg + svg,
        points: [...agg.points, p],
      };
    },
    { svg: '', points: [] as Point[] },
  );
}
