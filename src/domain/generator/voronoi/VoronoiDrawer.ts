import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { Cell } from './impl/Cell';
import { Point } from '../../../datatypes/Point';
import { Voronoi } from './impl/Voronoi';
import { SiteArea } from './impl/SiteArea';
import { Edge } from './impl/Edge';
import { HalfEdge } from './impl/HalfEdge';

const DEBUG = false;

export interface VoronoiConfig {
  style: {
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
  }
  cells: {
    gap: number,
  }
}

export function draw(config: VoronoiConfig, grid: number[][], boundingBox: BoundingBox) {
  const voronoi = new Voronoi(grid, boundingBox, config.cells.gap / 2);
  let svg = '';
  svg += voronoi.cells.map((cell: Cell, i: number) => drawCell(cell, style(i, config.style))).join('');
  if (DEBUG) {
    svg += voronoi.siteAreas.map((siteArea: SiteArea) => drawSiteArea(siteArea)).join('');
    svg += voronoi.edges.map((edge: Edge) => drawEdge(edge)).join('');
    svg += voronoi.vertices.map((vertex: Point) => drawPoint(vertex)).join('');
  }
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

function style(n: number, style: { fillColor: Color, strokeColor: Color, strokeWidth: number }) {
  return `
    fill="${style.fillColor.toRgbHex(n)}" 
    fill-opacity="${style.fillColor.alpha}"
    stroke="${style.strokeColor.toRgbHex(n)}" 
    stroke-opacity="${style.strokeColor.alpha}"
    stroke-width="${style.strokeWidth}" 
    vector-effect="non-scaling-stroke"
  `;
}
