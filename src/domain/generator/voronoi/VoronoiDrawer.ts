import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { Boundary } from './impl/Boundary';
import { Cell } from './impl/Cell';
import { Point } from '../../../datatypes/Point';
import { Voronoi } from './impl/Voronoi';

export interface VoronoiConfig {
  style: DrawStyle;
  color: Color;
  borderWidth: number;
}

export function draw(config: VoronoiConfig, grid: number[][], boundingBox: BoundingBox) {
  const boundary: Boundary = new Boundary(boundingBox);
  const offset = config.borderWidth / 10;
  const voronoi = new Voronoi(grid, boundary, offset);
  return voronoi.cells.map((cell: Cell, i: number) => drawElement(cell, style(i, config.color, config.style))).join('');
}

function drawElement(cell: Cell, style: string) {
  return `<path ${style} d="${
    cell.path.reduce((s: string, point: Point, i: number) => {
      if (i === 0) {
        return `M ${point[Point.X]}, ${point[Point.Y]} `;
      } else {
        return `${s} L ${point[Point.X]}, ${point[Point.Y]} `;
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
