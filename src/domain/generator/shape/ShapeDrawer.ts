import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';

export interface ShapeConfig {
  style: DrawStyle;
  color: Color;
  coordinateType: 'cartesian' | 'polar';
  midpoints: number;
  size: (n: number, items: number) => number;
  angle: (n: number, items: number, itemSize: number) => number;
  cutRatio0: (n: number, items: number, itemSize: number) => number;
  cutRatio1: (n: number, items: number, itemSize: number) => number;
}

export interface Props {
  config: ShapeConfig;
  grid: Point[];
}

interface ItemProps {
  size: number;
  midpoints: number;
  angle: number;
  cutRatio0: number;
  cutRatio1: number;
}

export function draw(config: ShapeConfig, grid: Point[]): { svg: string, boundingBox: BoundingBox } {
  const items: number = grid.length;
  return grid.reduce((agg, position: Point, i: number) => {
    const n = i + 1;
    const itemSize: number = config.size(n, items);
    const elementStyle = style(n, config.color, config.style);
    let svg = '';
    let boundingBox;
    if (0 < config.midpoints) {
      const itemProps = getItemProps(config, n, items, itemSize);
      const offset = (i: number) => 0 // i * 0.1 * (i%2 === 0 ? -1 : 1); // TODO as variable
      const smoothness = 1; // TODO as variable
      const shape = generateShape(config.midpoints, offset, smoothness, itemProps.cutRatio0, itemProps.cutRatio1);
      const convertedPoints = transform(
        position,
        config.coordinateType === 'polar' ? convertToPolar(shape) : shape, 
        itemProps.size, 
        itemProps.angle
      );
      svg = getSvg(convertedPoints, elementStyle);
      boundingBox = PointUtils.boundingBox(convertedPoints.filter((p, i) => i % 3 === 1));
    } else {
      const cutRatio1 = config.cutRatio1(n, items, itemSize);
      const startAngle = 360 * cutRatio1 + config.angle(n, items, itemSize);
      const angle = 360 * (1 - (cutRatio1 - config.cutRatio0(n, items, itemSize)));
      svg = drawArc(position, i, itemSize, startAngle, angle, elementStyle);
      boundingBox = {
        min: [position[Point.X] - itemSize / 2, position[Point.Y] - itemSize / 2],
        max: [position[Point.X] + itemSize / 2, position[Point.Y] + itemSize / 2],
      }
    }
    return {
      svg: agg.svg + svg,
      boundingBox: PointUtils.combineBoundingBoxes([agg.boundingBox, boundingBox]),
    };
  }, { svg: '', boundingBox: PointUtils.DEFAULT_BOUNDING_BOX });
}

function transform(origin: Point, points: Point[], size: number, angle: number): Point[] {
  const cos = Math.cos(angle * Math.PI / 180);
  const sin = Math.sin(angle * Math.PI / 180);

  const scaleAndRotate = (pt: Point) => [
    (pt[Point.X] * cos + pt[Point.Y] * sin) * size,
    (- pt[Point.X] * sin + pt[Point.Y] * cos) * size,
  ];
  const absolutePosition = (orig: Point, pt: Point) => [orig[Point.X] + pt[Point.X], orig[Point.Y] - pt[Point.Y]];

  return points.map(pt => absolutePosition(origin, scaleAndRotate(pt)));
}

function convertToPolar(points: Point[]): Point[] {
  const polarized = [];
  for(let i=1; i<points.length-1; i+=3) {
    
    const linePoint = points[i];
    const dPrev = PointUtils.distance(linePoint, points[i-1]);
    const dNext = PointUtils.distance(linePoint, points[i+1]);

    const d = linePoint[Point.Y] + 0.5;
    const rads = (linePoint[Point.X] + 0.5) * 2 * Math.PI;

    polarized[i-1] = [d * Math.cos(rads) + dPrev * Math.cos(rads - Math.PI/2),
       d * Math.sin(rads) + dPrev * Math.sin(rads - Math.PI/2)];
    polarized[i] = [d * Math.cos(rads), d * Math.sin(rads)];
    polarized[i+1] = [d * Math.cos(rads) + dNext * Math.cos(rads + Math.PI/2),
       d * Math.sin(rads) + dNext * Math.sin(rads + Math.PI/2)];
  }
  return polarized;
}

function getItemProps(
  config: ShapeConfig,
  n: number,
  items: number,
  size: number,
): ItemProps {
  const midpoints = config.midpoints;
  const angle = config.angle(n, items, size);
  const cutRatio0 = config.cutRatio0(n, items, size);
  const cutRatio1 = config.cutRatio1(n, items, size);
  return { size, midpoints, angle, cutRatio0, cutRatio1 };
}

function getSvg(points: Point[], style: string): string {
  let drawPoints = [...points];
  drawPoints.shift(); // remove first control point
  drawPoints.pop(); // remove last control point

  return `<path ${style} d="${drawPoints.reduce((s, pt, i) => {
    if ((i % 3 === 0 && i !== 0) || i % 3 === 2) {
      s = s + ' ' + pointAsSvg(pt);
    }
    if (i % 3 === 0) {
      s = s + ' M ' + pointAsSvg(pt);
    }
    if (i % 3 === 1) {
      s = s + ' C ' + pointAsSvg(pt);
    }
    return s;
  }, "")}" />`;
}

function generateShape(
  midpoints: number,
  offset: (i: number) => number,
  smoothness: number,
  cutRatio0: number,
  cutRatio1: number,
): Point[] {

  const sectionLength = 1 / (midpoints + 1);
  const basePoints: Point[] = [];
  for (let i = 0; i <= midpoints + 1; i++) {
    basePoints.push([-0.5 + sectionLength * i, 0 + offset(i)])
  }

  const pathPoints: Point[] = basePoints.reduce((path, linePoint) => {
    return [...path, 
      [linePoint[Point.X] - smoothness * sectionLength, linePoint[Point.Y]],
      linePoint,
      [linePoint[Point.X] + smoothness * sectionLength, linePoint[Point.Y]],
    ];
  }, [] as Point[]);

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

  return pathPoints;
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

function pointAsSvg(p: Point) {
  return `${p[Point.X]},${p[Point.Y]}`;
}

function style(n: number, color: Color, drawStyle: DrawStyle) {
  const itemColor = color.toString(n);
  return drawStyle === DrawStyle.FILLED
    ? `fill="${itemColor}"`
    : `fill="none" stroke="${itemColor}" stroke-width="1" vector-effect="non-scaling-stroke"`;
}
