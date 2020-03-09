import * as React from 'react';

import { Boundary, Cell, Point, Voronoi } from './impl/index';
import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';


export interface VoronoiConfig {
  style: DrawStyle;
  color: Color;
  borderWidth: number;
}

export interface Props {
  config: VoronoiConfig;
  grid: number[][];
}


export class VoronoiDrawer extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    const boundary: Boundary = new Boundary(this.boundingBox);
    const offset = this.props.config.borderWidth / 10;

    const voronoi = new Voronoi(this.props.grid, boundary, offset);

    return voronoi.cells.map((cell: Cell, i: number) => {
      const path = this.createPath(cell);
      const color = this.props.config.color.toString();
      const style = this.props.config.style === DrawStyle.STROKE ? { stroke: color, strokeWidth: '1' } : { fill: color };
      return {
        ...path,
        key: i,
        props: { ...path.props, ...style, vectorEffect: 'non-scaling-stroke' },
      };
    });

    /*
      voronoi.edges.map((edge, i) =>
        <line key={i} x1={edge.a.x} y1={edge.a.y} x2={edge.b.x} y2={edge.b.y} stroke='red' vectorEffect="non-scaling-stroke" />
      )
    }
    {
      voronoi.vertices.map((vertex: Point, i: number) =>
        <circle key={i} cx={vertex.x} cy={vertex.y} r={0.5} stroke='red' vectorEffect="non-scaling-stroke" />
      )
    */

    // cell.path.map((p, c) => <circle key={c} cx={p.x} cy={p.y} r={0.5} fill='red' />)
    // <circle cx={cell.center.x} cy={cell.center.y} r={0.5} fill='green' />
  }

  private createPath(cell: Cell): JSX.Element {
    return <path d={cell.path.reduce((s: string, point: Point, i: number) => {
      if (i === 0) {
        return `M ${point.x}, ${point.y} `;
      } else {
        return `${s} L ${point.x}, ${point.y} `;
      }
    }, '') + 'z'} />;
  }

  private get boundingBox(): BoundingBox {
    const { min, max } = this.props.grid.reduce((agg, pos, i) => {
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
    }, { min: { x: undefined, y: undefined }, max: { x: undefined, y: undefined } });
    return { x: min.x, y: min.y, w: max.x - min.x, h: max.y - min.y };
  }
}
