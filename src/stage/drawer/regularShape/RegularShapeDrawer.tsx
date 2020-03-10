import * as React from 'react';

import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';

export interface RegularShapeConfig {
  style: DrawStyle;
  color: Color;
  corners: number;
  size: (n: number, items: number) => number;
  angle: (n: number, items: number, itemSize: number) => number;
  ratio: (n: number, items: number, itemSize: number) => number;
  cutRatio0: (n: number, items: number, itemSize: number) => number;
  cutRatio1: (n: number, items: number, itemSize: number) => number;
}

export interface Props {
  config: RegularShapeConfig;
  grid: number[][];
}

interface ItemProps {
  size: number;
  corners: number;
  ratio: number;
  angle: number;
  cutRatio0: number;
  cutRatio1: number;
}


export class RegularShapeDrawer extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return <g>{
      this.createElements().map((e: JSX.Element, i) => {
        const itemColor = this.props.config.color.toString(i);
        return {
          ...e, key: i, props: {
            ...e.props,
            ...(this.props.config.style === DrawStyle.FILLED
              ? { fill: itemColor }
              : { fill: 'none', stroke: itemColor, strokeWidth: 1, vectorEffect: 'non-scaling-stroke' }),
            id: `item-${i}`,
          }
        };
      })
    }</g>;
  }

  private createElements() {
    const config = this.props.config;
    const items: number = this.props.grid.length;
    return this.props.grid.map((position: number[], i) => {
      const n = i + 1;
      const itemSize: number = config.size(n, items);
      if (config.corners > 0) {
        const itemProps = this.getItemProps(n, items, itemSize);
        return this.drawRegularShape(position, itemProps);
      } else {
        const cutRatio1 = config.cutRatio1(n, items, itemSize);
        const startAngle = (360 * cutRatio1) + config.angle(n, items, itemSize);
        const angle = 360 * (1 - (cutRatio1 - config.cutRatio0(n, items, itemSize)));
        return this.drawArc(position, itemSize, startAngle, angle);
      }
    });
  }

  private getItemProps(n: number, items: number, size: number): ItemProps {
    const config = this.props.config;
    const corners: number = config.corners;
    const ratio: number = config.ratio(n, items, size);
    const angle: number = config.angle(n, items, size);
    const cutRatio0: number = config.cutRatio0(n, items, size);
    const cutRatio1: number = config.cutRatio1(n, items, size);
    return { size, corners, ratio, angle, cutRatio0, cutRatio1 };
  }

  private isSamePosition(pA: number[], pB: number[]): boolean {
    return [0, 1].reduce((b, c) => b && pA && pB && Math.abs(pA[c] - pB[c]) < 0.0001 /*tolerance*/, true);
  }

  private drawRegularShape = (center: number[], itemProps: ItemProps): JSX.Element => {

    const { size, corners, ratio, angle, cutRatio0, cutRatio1 } = itemProps;

    // bring point coordinates in svg format
    const p = (pt: number[]) => ` ${center[0] - pt[0]},${center[1] - pt[1]} `;
    let pts: number[][] = [];
    let i: number;

    for (i = 0; i < corners; i++) {
      const loopBaseAngle = angle + i * 360 / corners;

      const rad = -(loopBaseAngle) / 180 * Math.PI;
      const rad2 = -Math.PI / corners;

      const normalizedPts = [
        rad - rad2, rad - rad2 - Math.PI / 2, rad - Math.PI / 2, rad,
        rad, rad + Math.PI / 2, rad + rad2 + Math.PI / 2, rad + rad2
      ].map(c => [Math.sin(c), Math.cos(c)]);

      const magicNumber = 1 / 3; // (2/3)*Math.tan(Math.PI/(2*corners)) // ensures a good circle approximation for ratio 1

      const multipliers = [
        size / 2 * ratio,               //  innerRadius
        size / 2 * ratio * magicNumber, //  innerAnchor
        size / 2 * ratio * magicNumber, //  outerAnchor
        size / 2                        //  outerRadius
      ];

      const mainPts = [
        normalizedPts[0].map(c => c * multipliers[0]),
        normalizedPts[3].map(c => c * multipliers[3]),
        normalizedPts[4].map(c => c * multipliers[3]),
        normalizedPts[7].map(c => c * multipliers[0]),
      ];

      const basePts = [...mainPts];
      basePts.splice(1, 0, normalizedPts[1].map((c, i) => mainPts[0][i] + c * multipliers[1] * 1));
      basePts.splice(2, 0, normalizedPts[2].map((c, i) => mainPts[1][i] + c * multipliers[2] * -1));
      basePts.splice(5, 0, normalizedPts[5].map((c, i) => mainPts[2][i] + c * multipliers[2] * -1));
      basePts.splice(6, 0, normalizedPts[6].map((c, i) => mainPts[3][i] + c * multipliers[1] * 1));

      if (cutRatio0 < cutRatio1) {
        pts = [
          ...pts,
          ...this.sliceBezier(basePts.slice(0, 4), cutRatio0),
          ...this.sliceBezier(basePts.slice(0, 4).reverse(), 1 - cutRatio1),
          ...this.sliceBezier(basePts.slice(4, 8), 1 - cutRatio1),
          ...this.sliceBezier(basePts.slice(4, 8).reverse(), cutRatio0)
        ];
      } else {
        pts = [
          ...pts,
          ...basePts
        ];
      }
    }

    return <path d={pts.reduce((s, pt, j) => {
      if (i === 0 && j === 0) {
        return 'M ' + p(pt);
      } else if (j % 4 === 0) {
        return s + (this.isSamePosition(pts[(j - 1) % pts.length], pt) ? '' : ' M ' + p(pt));
      } else {
        return s + (j % 4 === 1 ? ' C ' : '') + p(pt);
      }
    }, '')} />;
  }

  private sliceBezier = (pts: number[][], t: number) => {
    const p01 = [0, 1].map(c => (pts[1][c] - pts[0][c]) * t + pts[0][c]);
    const p12 = [0, 1].map(c => (pts[2][c] - pts[1][c]) * t + pts[1][c]);
    const p23 = [0, 1].map(c => (pts[3][c] - pts[2][c]) * t + pts[2][c]);
    const p012 = [0, 1].map(c => (p12[c] - p01[c]) * t + p01[c]);
    const p123 = [0, 1].map(c => (p23[c] - p12[c]) * t + p12[c]);
    const pt = [0, 1].map(c => (p123[c] - p012[c]) * t + p012[c]);
    return [pts[0], p01, p012, pt];
  }


  private drawArc = (center: number[], size: number, startAngle: number, angle: number): JSX.Element => {
    const p = (pt: number[]) => ' ' + pt[0] + ',' + pt[1] + ' '; //bring point coordinates in svg format
    if (angle <= -360 || 360 <= angle) {
      return <circle cx={center[0]} cy={center[1]} r={size / 2} />;
    } else {
      const r = size / 2;
      const startRad = startAngle / 180 * Math.PI;
      const startPt = [center[0] + Math.cos(startRad) * r, center[1] + Math.sin(startRad) * r];
      const endRad = (startAngle + angle) / 180 * Math.PI;
      const endPt = [center[0] + Math.cos(endRad) * r, center[1] + Math.sin(endRad) * r];
      return <path d={'M ' + p(startPt) + ' A ' + r + ',' + r + ' 0 ' + (angle % 360 < 180 ? 0 : 1) + ' 1 ' + p(endPt)} />;
    }
  }
}
