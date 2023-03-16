import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';
import { random } from '../../../utils/Random';
import { MathUtils } from '../../../utils/MathUtils';

export interface ShapeConfig {
  border: Color;
  fill: Color;
  coordinateType: 'cartesian' | 'polar';
  edges: number;
  smoothness: number;
  noise: number;
  probabilityDistributionMuRandomness: number;
  probabilityDistributionSigma: number;
  probabilityDistributionSigmaRandomness: number;
  probabilityDistributionNoise: number;
  size: (n: number, items: number) => number;
  angle: (n: number, items: number, itemSize: number) => number;
  cutRatio0: (n: number, items: number, itemSize: number) => number;
  cutRatio1: (n: number, items: number, itemSize: number) => number;
  offset: (i: number) => number;
}

export interface Props {
  config: ShapeConfig;
  grid: Point[];
}

interface ItemProps {
  size: number;
  edges: number;
  angle: number;
  cutRatio0: number;
  cutRatio1: number;
}

export function draw(config: ShapeConfig, grid: Point[]): { svg: string, boundingBox: BoundingBox } {
  const items: number = grid.length;
  return grid.reduce((agg, position: Point, i: number) => {
    const n = i + 1;
    const itemSize: number = config.size(n, items);
    const elementStyle = style(n, config.border, config.fill);
    let svg = '';
    let boundingBox;
    if (config.edges <= 1 && config.coordinateType === 'polar') {
      const cutRatio1 = config.cutRatio1(n, items, itemSize);
      const startAngle = 360 * cutRatio1 + config.angle(n, items, itemSize);
      const angle = 360 * (1 - (cutRatio1 - config.cutRatio0(n, items, itemSize)));
      svg = drawArc(position, i, itemSize, startAngle, angle, elementStyle);
      boundingBox = {
        min: [position[Point.X] - itemSize / 2, position[Point.Y] - itemSize / 2],
        max: [position[Point.X] + itemSize / 2, position[Point.Y] + itemSize / 2],
      }
    } else {
      const itemProps = getItemProps(config, n, items, itemSize);
      const points = [
        () => generateShape(config.edges, config.offset),
        (pnts: Point[]) => probabilityDistribution(
          pnts,
          n, 
          config.probabilityDistributionMuRandomness,
          config.probabilityDistributionSigma,
          config.probabilityDistributionSigmaRandomness,
          config.probabilityDistributionNoise,
        ),
        (pnts: Point[]) => noise(pnts, n, config.noise),
        (pnts: Point[]) => config.coordinateType === 'polar' ? toPolar(pnts) : pnts,
        (pnts: Point[]) => transform(pnts, position, itemProps.size, itemProps.angle),
        (pnts: Point[]) => smooth(pnts, config.smoothness),
        // (pnts: Point[]) => cut(pnts, itemProps.cutRatio0, itemProps.cutRatio1),
      ].reduce((pnts, fun) => fun(pnts), [] as Point[]);
      svg = drawShapeSvg(points, elementStyle);
      boundingBox = PointUtils.boundingBox(points);
    }
    return {
      svg: agg.svg + svg,
      boundingBox: PointUtils.combineBoundingBoxes([agg.boundingBox, boundingBox]),
    };
  }, { svg: '', boundingBox: PointUtils.DEFAULT_BOUNDING_BOX });
}

function generateShape(edges: number, offset: (i: number) => number): Point[] {
  const pnts: Point[] = [];
  const sectionLength = 1 / edges;
  for (let i = 0; i <= edges; i++) {
    pnts.push([-0.5 + i * sectionLength, offset(i+1)]);  
  }
  return pnts;
}

function probabilityDistribution(pnts: Point[], n: number, mu: number, sigma: number, sigmaRandomness: number, noise: number): Point[] {
  return pnts.map((pnt, i) => {
    const scale = 0.02;
    const pdf = sigma <= 0 ? 0 : generatePdf(pnt[Point.X], mu, sigma, sigmaRandomness, n * 15.07);
    const dy = pdf * scale - noise * pdf * random(0, scale, ((n * pnts.length) + i) * 1956);
    return [pnt[Point.X], pnt[Point.Y] + dy];
  });
}

function generatePdf(x: number, mu: number, sigma: number, sigmaRandomness: number, seed: number): number {
  const randomMu = random(-mu/2, mu/2, seed * 18.05);
  const randomSigma = sigma * random(0.1, 0.1 + sigmaRandomness, seed * 1980);
  // Love will tear us apart //
  return MathUtils.normalPdf(x, randomMu, randomSigma);
}

function noise(pnts: Point[], n: number, noise: number): Point[] {
  return pnts.map((pnt, i) => {
    const dy = random(noise * -0.01, noise * 0.01, ((n * pnts.length) + i % (pnts.length - 1)));
    return [pnt[Point.X], pnt[Point.Y] + dy];
  });
}

function toPolar(pnts: Point[]): Point[] {
  return pnts.map(pnt => {
    const d = pnt[Point.Y] + 0.5;
    const rads = (pnt[Point.X] + 0.5) * Math.PI * 2 + Math.PI / 2;
    return [d * Math.cos(rads), d * Math.sin(rads)];
  });
}

function smooth(pnts: Point[], smoothness: number): Point[] {
  return pnts.reduce((smoothedPnts, pnt, i) => {
    const n = pnts.length - 1;
    const correctionFactor = 2/3*Math.tan(Math.PI/2/n) / Math.sin(Math.PI/n);

    const pntPrev = pnts[(i === 0 ? pnts.length - 1 : i) - 1];
    const pntNext = pnts[(i === pnts.length - 1 ? 0 : i) + 1];
    
    const dX = pntNext[Point.X] - pntPrev[Point.X];
    const dY = pntNext[Point.Y] - pntPrev[Point.Y];
    const rads = Math.atan2(dY, dX);

    const dPrev = smoothness * correctionFactor * PointUtils.distance(pnt, pntPrev);
    const dNext = smoothness * correctionFactor * PointUtils.distance(pnt, pntNext);

    return [...smoothedPnts, 
      [pnt[Point.X] + dPrev * Math.cos(rads + Math.PI), pnt[Point.Y] + dPrev * Math.sin(rads + Math.PI)], 
      pnt,
      [pnt[Point.X] + dNext * Math.cos(rads), pnt[Point.Y] + dNext * Math.sin(rads)],
    ];
  }, [] as Point[]);
}

    /*

    const dPrev = PointUtils.distance(linePoint, points[i-1]);
    const dNext = PointUtils.distance(linePoint, points[i+1]);
    
    polarized[i-1] = [d * Math.cos(rads) + dPrev * Math.cos(rads - Math.PI/2),
      d * Math.sin(rads) + dPrev * Math.sin(rads - Math.PI/2)];
      
      polarized[i+1] = [d * Math.cos(rads) + dNext * Math.cos(rads + Math.PI/2),
        d * Math.sin(rads) + dNext * Math.sin(rads + Math.PI/2)];
          
        
        
        return [...path, 
      [linePoint[Point.X] * sectionLength, linePoint[Point.Y]],
      linePoint,
      [linePoint[Point.X] + smoothness * sectionLength, linePoint[Point.Y]],
    ];
  }, [] as Point[];
    */

  /*if (cutRatio0 < cutRatio1) {
    pathPoints = [
      ...pathPoints,
      ...sliceBezier(basePts.slice(0, 4), cutRatio0),
      ...sliceBezier(basePts.slice(0, 4).reverse(), 1 - cutRatio1),
      ...sliceBezier(basePts.slice(4, 8), 1 - cutRatio1),
      ...sliceBezier(basePts.slice(4, 8).reverse(), cutRatio0),
    ];
  } else {
    pts = [...pts, ...basePts];
  }*/


function transform(points: Point[], origin: Point, size: number, angle: number): Point[] {
  const cos = Math.cos(angle * Math.PI / 180);
  const sin = Math.sin(angle * Math.PI / 180);

  const scaleAndRotate = (pt: Point) => [
    (pt[Point.X] * cos + pt[Point.Y] * sin) * size,
    (- pt[Point.X] * sin + pt[Point.Y] * cos) * size,
  ];
  const absolutePosition = (orig: Point, pt: Point) => [orig[Point.X] + pt[Point.X], orig[Point.Y] - pt[Point.Y]];

  return points.map(pt => absolutePosition(origin, scaleAndRotate(pt)));
}

function getItemProps(
  config: ShapeConfig,
  n: number,
  items: number,
  size: number,
): ItemProps {
  const edges = config.edges;
  const angle = config.angle(n, items, size);
  const cutRatio0 = config.cutRatio0(n, items, size);
  const cutRatio1 = config.cutRatio1(n, items, size);
  return { size, edges, angle, cutRatio0, cutRatio1 };
}

function sliceBezier(pts: Point[], t: number): Point[] {
  const p01 = [Point.X, Point.Y].map((c) => (pts[1][c] - pts[0][c]) * t + pts[0][c]);
  const p12 = [Point.X, Point.Y].map((c) => (pts[2][c] - pts[1][c]) * t + pts[1][c]);
  const p23 = [Point.X, Point.Y].map((c) => (pts[3][c] - pts[2][c]) * t + pts[2][c]);
  const p012 = [Point.X, Point.Y].map((c) => (p12[c] - p01[c]) * t + p01[c]);
  const p123 = [Point.X, Point.Y].map((c) => (p23[c] - p12[c]) * t + p12[c]);
  const pt = [Point.X, Point.Y].map((c) => (p123[c] - p012[c]) * t + p012[c]);
  return [pts[0], p01, p012, pt];
}

function pointAsSvg(p: Point) {
  return `${p[Point.X]},${p[Point.Y]}`;
}

function style(n: number, border: Color, fill: Color) {
  const borderColor = border.toString(n);
  const fillColor = fill.toString(n);
  return `fill="${fillColor}" stroke="${borderColor}" stroke-width="1" vector-effect="non-scaling-stroke"`;
}

function drawArc(
  center: Point,
  n: number,
  size: number,
  startAngle: number,
  angle: number,
  style: string,
): string {
  if (angle <= -360 || 360 <= angle) {
    return `<circle ${style} cx="${center[Point.X]}" cy="${center[Point.Y]}" r="${
      size / 2
      }" />`;
  } else {
    const r = size / 2;
    const startRad = (startAngle / 180) * Math.PI;
    const startPt = [
      center[Point.X] + Math.cos(startRad) * r,
      center[Point.Y] + Math.sin(startRad) * r,
    ];
    const endRad = ((startAngle + angle) / 180) * Math.PI;
    const endPt = [
      center[Point.X] + Math.cos(endRad) * r,
      center[Point.Y] + Math.sin(endRad) * r,
    ];
    return `<path ${style} d="${`M ${pointAsSvg(startPt)} A ${r},${r} 0 ${
      angle % 360 < 180 ? 0 : 1
      }  1 ${pointAsSvg(endPt)}`}" />`;
  }
}

function drawShapeSvg(points: Point[], style: string): string {
  let drawPoints = [...points];
  drawPoints.shift(); // remove first control point
  drawPoints.pop(); // remove last control point

  return `<path ${style} d="${drawPoints.reduce((s, pt, i) => {
    if ((i % 3 === 0) || i % 3 === 2) {
      s = s + ' ' + pointAsSvg(pt);
    }
    /*if (i % 3 === 0) {
      s = s + ' M ' + pointAsSvg(pt);
    }*/
    if (i % 3 === 1) {
      s = s + ' C ' + pointAsSvg(pt);
    }
    return s;
  }, 'M')}" />`;
}
