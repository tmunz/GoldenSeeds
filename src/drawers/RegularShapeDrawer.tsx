import * as React from 'react';

import { DrawType } from '../datatypes/DrawConfig';
import { AbstractDrawer, Props } from './AbstractDrawer';


export class RegularShapeDrawer extends AbstractDrawer {

  constructor(props: Props) {
    super(props);
  }

  private sliceBezier = (pts: number[][], t: number) => {
    let p01 = [0, 1].map(c => (pts[1][c] - pts[0][c]) * t + pts[0][c])
    let p12 = [0, 1].map(c => (pts[2][c] - pts[1][c]) * t + pts[1][c])
    let p23 = [0, 1].map(c => (pts[3][c] - pts[2][c]) * t + pts[2][c])
    let p012 = [0, 1].map(c => (p12[c] - p01[c]) * t + p01[c])
    let p123 = [0, 1].map(c => (p23[c] - p12[c]) * t + p12[c])
    let pt = [0, 1].map(c => (p123[c] - p012[c]) * t + p012[c])
    return [pts[0], p01, p012, pt]
  }

  drawRegularShape = (center: number[], size: number, corners: number,
    ratio: number, angle: number, cutRatio0: number, cutRatio1: number): JSX.Element => {

    let p = (pt: number[]) => ' ' + (center[0] - pt[0]) + ',' + (center[1] - pt[1]) + ' ' //bring point coordinates in svg format
    let pts: number[][] = [];

    for (var i = 0; i < corners; i++) {
      let loopBaseAngle = angle + i * 360 / corners;

      let rad = -(loopBaseAngle) / 180 * Math.PI;
      let rad2 = -Math.PI / corners;

      let normalizedPts = [
        rad - rad2, rad - rad2 - Math.PI / 2, rad - Math.PI / 2, rad,
        rad, rad + Math.PI / 2, rad + rad2 + Math.PI / 2, rad + rad2
      ].map(c => [Math.sin(c), Math.cos(c)]);

      let magicNumber = 1 / 3 // (2/3)*Math.tan(Math.PI/(2*corners)) // would ensures a good circle approximation for ratio 1

      let multipliers = [
        size / 2 * ratio,               //  innerRadius
        size / 2 * ratio * magicNumber, //  innerAnchor
        size / 2 * ratio * magicNumber, //  outerAnchor
        size / 2                        //  outerRadius
      ];

      let mainPts = [
        normalizedPts[0].map(c => c * multipliers[0]),
        normalizedPts[3].map(c => c * multipliers[3]),
        normalizedPts[4].map(c => c * multipliers[3]),
        normalizedPts[7].map(c => c * multipliers[0]),
      ];

      let basePts = [...mainPts];
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

  drawArc = (center: number[], size: number, startAngle: number, angle: number): JSX.Element => {
    let p = (pt: number[]) => ' ' + pt[0] + ',' + pt[1] + ' '; //bring point coordinates in svg format
    if (angle <= -360 || 360 <= angle) {
      return <circle cx={center[0]} cy={center[1]} r={size / 2} />;
    } else {
      let r = size / 2;
      let startRad = startAngle / 180 * Math.PI;
      let startPt = [center[0] + Math.cos(startRad) * r, center[1] + Math.sin(startRad) * r];
      let endRad = (startAngle + angle) / 180 * Math.PI;
      let endPt = [center[0] + Math.cos(endRad) * r, center[1] + Math.sin(endRad) * r];
      return <path d={'M ' + p(startPt) + ' A ' + r + ',' + r + ' 0 ' + (angle % 360 < 180 ? 0 : 1) + ' 1 ' + p(endPt)} />;
    }
  }

  createElements() {
    return this.props.itemPositions.map((position: number[], i) => {
      let n = i + 1;
      return this.props.config.itemCorners > 0 ?
        this.drawRegularShape(position, this.props.scale * this.props.config.itemSize(n), this.props.config.itemCorners, this.props.config.itemRatio(n),
          this.props.config.itemAngle(n), this.props.config.cutRatio0(n), this.props.config.cutRatio1(n)) :
        this.drawArc(position, this.props.scale * this.props.config.itemSize(n), (360 * this.props.config.cutRatio1(n)) + this.props.config.itemAngle(n),
          360 * (1 - (this.props.config.cutRatio1(n) - this.props.config.cutRatio0(n)))
        );
    });
  }
}