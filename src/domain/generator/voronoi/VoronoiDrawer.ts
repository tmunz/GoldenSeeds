import { Boundary, Cell, Point, Voronoi } from './impl/index';
import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';

export interface VoronoiConfig {
  style: DrawStyle;
  color: Color;
  borderWidth: number;
}

export function draw(config: VoronoiConfig, grid: number[][]) {
  const boundary: Boundary = new Boundary(boundingBox(grid));
  const offset = config.borderWidth / 10;
  const voronoi = new Voronoi(grid, boundary, offset);
  return voronoi.cells
    .map((cell: Cell, i: number) =>
      drawElement(cell, style(i, config.color, config.style)),
    )
    .join('');
}

function boundingBox(grid: number[][]): BoundingBox {
  const { min, max } = grid.reduce(
    (agg, pos, i) => {
      if (!isFinite(agg.min.x) || pos[0] < agg.min.x) {
        agg.min.x = pos[0];
      }
      if (!isFinite(agg.min.y) || pos[1] < agg.min.y) {
        agg.min.y = pos[1];
      }
      if (!isFinite(agg.max.x) || agg.max.x < pos[0]) {
        agg.max.x = pos[0];
      }
      if (!isFinite(agg.max.y) || agg.max.y < pos[1]) {
        agg.max.y = pos[1];
      }
      return agg;
    },
    {
      min: { x: undefined, y: undefined },
      max: { x: undefined, y: undefined },
    },
  );
  return { x: min.x, y: min.y, w: max.x - min.x, h: max.y - min.y };
}

function drawElement(cell: Cell, style: string) {
  return `<path ${style} d="${
    cell.path.reduce((s: string, point: Point, i: number) => {
      if (i === 0) {
        return `M ${point.x}, ${point.y} `;
      } else {
        return `${s} L ${point.x}, ${point.y} `;
      }
    }, '') + 'z'
  }" />`;
}

function style(n: number, color: Color, drawStyle: DrawStyle) {
  const itemColor = color.toString(n);
  return drawStyle === DrawStyle.FILLED
    ? `fill="${itemColor}"`
    : `fill="none" stroke="${itemColor}" stroke-width="1" vectorEffect="non-scaling-stroke"`;
}
