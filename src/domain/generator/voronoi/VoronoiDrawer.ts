import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { Cell } from './impl/Cell';
import { Voronoi } from './impl/Voronoi';
import { fillAttributes, polylinePathData, strokeAttributes } from '../SvgPrimitives';

export interface VoronoiConfig {
  style: {
    fillColor: Color;
    strokeColor: Color;
    strokeWidth: number;
  };
  cells: {
    gap: number;
  };
}

export function draw(config: VoronoiConfig, points: number[][], boundingBox: BoundingBox) {
  const voronoi = new Voronoi(points, boundingBox, config.cells.gap / 2);
  return voronoi.cells.map((cell: Cell, i: number) => drawCell(cell, style(i, config.style))).join('');
}

function drawCell(cell: Cell, style: string) {
  return `<path ${style} d="${polylinePathData(cell.path, true)}" />`;
}

function style(n: number, style: { fillColor: Color; strokeColor: Color; strokeWidth: number }) {
  return `${fillAttributes(style.fillColor, n)}
    ${strokeAttributes(style.strokeColor, n, style.strokeWidth)}`;
}
