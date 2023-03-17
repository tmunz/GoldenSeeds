import { DrawStyle } from '../../../datatypes/DrawStyle';
import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';

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
  grid: Point[];
}

interface ItemProps {
  size: number;
  corners: number;
  ratio: number;
  angle: number;
  cutRatio0: number;
  cutRatio1: number;
}

export function draw(
  config: RegularShapeConfig,
  grid: Point[],
): { svg: string; boundingBox: BoundingBox } {
  const items: number = grid.length;
  return grid.reduce(
    (agg, position: Point, i: number) => {
      const n = i + 1;
      const itemSize: number = config.size(n, items);
      const elementStyle = style(n, config.color, config.style);
      let svg = '';
      if (0 < config.corners) {
        const itemProps = getItemProps(config, n, items, itemSize);
        svg = drawRegularShape(position, itemProps, elementStyle);
      } else {
        const cutRatio1 = config.cutRatio1(n, items, itemSize);
        const startAngle = 360 * cutRatio1 + config.angle(n, items, itemSize);
        const angle =
          360 * (1 - (cutRatio1 - config.cutRatio0(n, items, itemSize)));
        svg = drawArc(position, i, itemSize, startAngle, angle, elementStyle);
      }
      const boundingBox = {
        min: [
          position[Point.X] - itemSize / 2,
          position[Point.Y] - itemSize / 2,
        ],
        max: [
          position[Point.X] + itemSize / 2,
          position[Point.Y] + itemSize / 2,
        ],
      };
      return {
        svg: agg.svg + svg,
        boundingBox: PointUtils.combineBoundingBoxes([
          agg.boundingBox,
          boundingBox,
        ]),
      };
    },
    { svg: '', boundingBox: PointUtils.DEFAULT_BOUNDING_BOX },
  );
}

function getItemProps(
  config: RegularShapeConfig,
  n: number,
  items: number,
  size: number,
): ItemProps {
  const corners: number = config.corners;
  const ratio: number = config.ratio(n, items, size);
  const angle: number = config.angle(n, items, size);
  const cutRatio0: number = config.cutRatio0(n, items, size);
  const cutRatio1: number = config.cutRatio1(n, items, size);
  return { size, corners, ratio, angle, cutRatio0, cutRatio1 };
}

function isSamePosition(pA: Point, pB: Point): boolean {
  return [Point.X, Point.Y].reduce(
    (b: boolean, t: number) =>
      b && pA && pB && Math.abs(pA[t] - pB[t]) < 0.0001 /*tolerance*/,
    true,
  );
}

function drawRegularShape(
  center: Point,
  itemProps: ItemProps,
  style: string,
): string {
  const { size, corners, ratio, angle, cutRatio0, cutRatio1 } = itemProps;

  const p = (pt: Point) =>
    ` ${center[Point.X] - pt[Point.X]},${center[Point.Y] - pt[Point.Y]} `;
  let pts: Point[] = [];
  let i: number;

  for (i = 0; i < corners; i++) {
    const loopBaseAngle = angle + (i * 360) / corners;

    const rad = (-loopBaseAngle / 180) * Math.PI;
    const rad2 = -Math.PI / corners;

    // 4 point path with bezier anchors
    // 0 3 4 7 are points on line
    // 1 2 5 6 the according anchor
    const normalizedPts = [
      rad - rad2,
      rad - rad2 - Math.PI / 2,
      rad - Math.PI / 2,
      rad,
      rad,
      rad + Math.PI / 2,
      rad + rad2 + Math.PI / 2,
      rad + rad2,
    ].map((c) => [Math.sin(c), Math.cos(c)]);

    // (2/3)*Math.tan(Math.PI/(2*corners)) // ensures a good circle approximation for ratio 1
    //  1.5 * Math.pow(corners, -1.189543) // more performant apporximation
    // TODO variable sharpness
    const magicNumber = 1 / 3 - corners / 100;

    const multipliers = [
      (size / 2) * ratio, //  innerRadius
      (size / 2) * ratio * magicNumber, //  innerAnchor
      (size / 2) * ratio * magicNumber, //  outerAnchor
      size / 2, //  outerRadius
    ];

    const mainPts = [
      normalizedPts[0].map((c) => c * multipliers[0]),
      normalizedPts[3].map((c) => c * multipliers[3]),
      normalizedPts[4].map((c) => c * multipliers[3]),
      normalizedPts[7].map((c) => c * multipliers[0]),
    ];

    const basePts = [...mainPts];
    basePts.splice(
      1,
      0,
      normalizedPts[1].map((c, i) => mainPts[0][i] + c * multipliers[1] * 1),
    );
    basePts.splice(
      2,
      0,
      normalizedPts[2].map((c, i) => mainPts[1][i] + c * multipliers[2] * -1),
    );
    basePts.splice(
      5,
      0,
      normalizedPts[5].map((c, i) => mainPts[2][i] + c * multipliers[2] * -1),
    );
    basePts.splice(
      6,
      0,
      normalizedPts[6].map((c, i) => mainPts[3][i] + c * multipliers[1] * 1),
    );

    if (cutRatio0 < cutRatio1) {
      pts = [
        ...pts,
        ...sliceBezier(basePts.slice(0, 4), cutRatio0),
        ...sliceBezier(basePts.slice(0, 4).reverse(), 1 - cutRatio1),
        ...sliceBezier(basePts.slice(4, 8), 1 - cutRatio1),
        ...sliceBezier(basePts.slice(4, 8).reverse(), cutRatio0),
      ];
    } else {
      pts = [...pts, ...basePts];
    }
  }

  return `<path ${style} d="${pts.reduce((s, pt, j) => {
    if (i === 0 && j === 0) {
      return 'M ' + p(pt);
    } else if (j % 4 === 0) {
      return (
        s + (isSamePosition(pts[(j - 1) % pts.length], pt) ? '' : ' M ' + p(pt))
      );
    } else {
      return s + (j % 4 === 1 ? ' C ' : '') + p(pt);
    }
  }, '')}" />`;
}

function sliceBezier(pts: Point[], t: number) {
  const p01 = [Point.X, Point.Y].map(
    (c) => (pts[1][c] - pts[0][c]) * t + pts[0][c],
  );
  const p12 = [Point.X, Point.Y].map(
    (c) => (pts[2][c] - pts[1][c]) * t + pts[1][c],
  );
  const p23 = [Point.X, Point.Y].map(
    (c) => (pts[3][c] - pts[2][c]) * t + pts[2][c],
  );
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
    return `<circle ${style} cx="${center[Point.X]}" cy="${
      center[Point.Y]
    }" r="${size / 2}" />`;
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
  return `${p[Point.X]},${p[Point.Y]} `;
}

function style(n: number, color: Color, drawStyle: DrawStyle) {
  const itemColor = color.toString(n);
  return drawStyle === DrawStyle.FILLED
    ? `fill="${itemColor}"`
    : `fill="none" stroke="${itemColor}" stroke-width="1" vector-effect="non-scaling-stroke"`;
}
