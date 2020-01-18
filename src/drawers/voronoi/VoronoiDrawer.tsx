import * as React from 'react';

import { AbstractDrawer, Props } from '../AbstractDrawer';
import { Boundary, Cell, Edge, Point, Voronoi } from './index';
import { Math2d } from './math/Math2d';


export class VoronoiDrawer extends AbstractDrawer {

  constructor(props: Props) {
    super(props);
  }

  private createPath(cell: Cell): JSX.Element {
    return <path d={cell.path.reduce((s: string, point: Point, i: number) => {
      if (i === 0) {
        return `M ${point.x}, ${point.y} `;
      } else {
        return `${s} L ${point.x}, ${point.y} `;
      }
    }, '') + 'z'} />
  }

  createElements(): JSX.Element[] {

    const size: number = this.props.config.size;
    const boundary: Boundary = new Boundary((this.props.width - size) / 2, (this.props.height - size) / 2, size, size);
    const offset = 0;

    let voronoi = new Voronoi(this.props.itemPositions, boundary, offset);

    let cells = voronoi.cells.map(cell => this.createPath(cell))
    let debug = [<React.Fragment>
      {
        voronoi.cells.map((cell: Cell, i: number) => {
          const path = this.createPath(cell);
          return <React.Fragment key={i}>
            {
              { ...path, props: { ...path.props, stroke: 'green', strokeWidth: '4', fill: 'pink' } }
            }
            {
              cell.path.map(p => <circle cx={p.x} cy={p.y} r={2} fill='red' />)
            }
            <circle cx={cell.center.x} cy={cell.center.y} r={5} fill='green' />
          </React.Fragment>
        })
      }
      {/*
          voronoi.edges.map((edge: Edge, i: number) =>
            <line key={i} x1={edge.a.x} y1={edge.a.y} x2={edge.b.x} y2={edge.b.y} stroke='red' />
          )
        }
        {
          voronoi.vertices.map((vertex: Point, i: number) =>
            <circle key={i} cx={vertex.x} cy={vertex.y} r={3} stroke='red' />
          )
        */}
    </React.Fragment>
    ];

    let point = { x: 400, y: 400 };
    let prev = { x: 400, y: 200 };
    let next = { x: 600, y: 400 };
    
    const angle = Math2d.angleAt(point, prev, next);
    // const distance = Math2d.calculateTriangleSide(offset, angle / 2, Math.PI / 2);
    const newP = Math2d.calculatePointWithAngleAndDistance(point, prev, angle / 2, 100);
    console.log(angle, newP);

    let math = [
      <React.Fragment>
        <path d={`M ${point.x} ${point.y} L ${prev.x} ${prev.y}`} strokeWidth='4' stroke='pink' />
        <path d={`M ${point.x} ${point.y} L ${next.x} ${next.y}`} strokeWidth='4' stroke='orange' />
        <path d={`M ${point.x} ${point.y} L ${newP.x} ${newP.y}`} strokeWidth='4' stroke='red' />
      </React.Fragment>
    ];

    return cells;
    // return debug;
    // return math;
  }
}
