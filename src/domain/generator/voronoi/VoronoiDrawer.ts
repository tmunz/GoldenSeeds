import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { Boundary } from './impl/Boundary';
import { Cell } from './impl/Cell';
import { Point } from '../../../datatypes/Point';
import { Voronoi } from './impl/Voronoi';
import { SiteArea } from './impl/SiteArea';
import { Edge } from './impl/Edge';
import { HalfEdge } from './impl/HalfEdge';

export interface VoronoiConfig {
  style: DrawStyle;
  color: Color;
  gap: number;
}

export function draw(config: VoronoiConfig, grid: number[][], boundingBox: BoundingBox) {
  const voronoi = new Voronoi(grid, boundingBox, config.gap / 2);
  let svg = '';
  svg += voronoi.cells.map((cell: Cell, i: number) => drawCell(cell, style(i, config.color, config.style))).join('');
  // svg += voronoi.siteAreas.map((siteArea: SiteArea) => drawSiteArea(siteArea)).join('');
  // svg += voronoi.edges.map((edge: Edge) => drawEdge(edge)).join('');
  // svg += voronoi.vertices.map((vertex: Point) => drawPoint(vertex)).join('');
  return svg;
}

function drawSiteArea(siteArea: SiteArea) {
  return `<path stroke="yellow" stroke-width="0.5" fill="yellow" fill-opacity="50%" d="${
    siteArea.halfEdges.reduce((s: string, halfEdge: HalfEdge, i: number) => {
      if (i === 0) {
        return `M ${halfEdge.getStartpoint()[Point.X]},${halfEdge.getStartpoint()[Point.Y]} `;
      } else {
        return `${s} L ${halfEdge.getStartpoint()[Point.X]},${halfEdge.getStartpoint()[Point.Y]} `;
      }
    }, '') + 'z'
  }" />`;
}

function drawEdge(edge: Edge) {
  const start = edge.getStartPoint();
  const end = edge.getEndPoint();
  return start && end
    ? `<path stroke="blue" stroke-width="0.1" d="M ${start[Point.X]},${start[Point.Y]} 
     L ${end[Point.X]},${end[Point.Y]}" />`
    : '';
}

function drawPoint(point: Point) {
  return `<circle cx="${point[Point.X]}" cy="${point[Point.Y]}" r="${0.33}" fill="purple" />`;
}

function drawCell(cell: Cell, style: string) {
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
    : `fill="none" stroke="${itemColor}" stroke-width="1" vector-effect="non-scaling-stroke"`;
}
