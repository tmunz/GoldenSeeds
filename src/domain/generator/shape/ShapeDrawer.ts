import { Color } from '../../../datatypes/Color';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { PointUtils } from '../../../utils/PointUtils';
import { Point } from '../../../datatypes/Point';
import { random } from '../../../utils/Random';
import { MathUtils } from '../../../utils/MathUtils';

// alternative "0.5 / MATH.PI" to maintain circumfence instead of diameter
const POLAR_BASE_D = 0.5;

export interface ShapeConfig {
  border: Color;
  fill: Color;

  size: (n: number, items: number) => number;
  angle: (n: number, items: number, size: number) => number;

  projection: 'circular' | 'linear';
  circlularProjectionFullAngle: number;
  edges: number;
  offset: (n: number, items: number, size: number, i: number) => number;

  smoothness: (n: number, items: number, size: number) => number;
  noise: number;

  probabilityDistributionMuRandomness: number;
  probabilityDistributionSigma: number;
  probabilityDistributionSigmaRandomness: number;
  probabilityDistributionNoise: number;

  cutRatio0: (n: number, items: number, size: number, i: number) => number;
  cutRatio1: (n: number, items: number, size: number, i: number) => number;

  seed: number;
}

export interface Props {
  config: ShapeConfig;
  grid: Point[];
}

interface ItemProps {
  size: number;
  edges: number;
  angle: number;
  smoothness: number;
}

export function draw(config: ShapeConfig, grid: Point[]): { svg: string; boundingBox: BoundingBox } {
  const items: number = grid.length;
  return grid.reduce(
    (agg, position: Point, m: number) => {
      const n = m + 1;
      const size: number = config.size(n, items);
      const elementStyle = style(n, config.border, config.fill);
      let svg = '';
      let boundingBox;
      if (config.edges <= 1 && config.projection === 'circular') {
        const cutRatio1 = config.cutRatio1(n, items, size, 1);
        const startAngle = 360 * cutRatio1 + config.angle(n, items, size);
        const angle = 360 * (1 - (cutRatio1 - config.cutRatio0(n, items, size, 1)));
        svg = drawArc(position, size + 2 * config.offset(n, items, size, 1), startAngle, angle, elementStyle);
        boundingBox = {
          min: [position[Point.X] - size / 2, position[Point.Y] - size / 2],
          max: [position[Point.X] + size / 2, position[Point.Y] + size / 2],
        };
      } else {
        const itemProps = getItemProps(config, n, items, size);
        const points = [
          () => generateShape(config.edges, (i: number) => config.offset(n, items, size, i)),
          (pnts: Point[]) =>
            0 < config.probabilityDistributionSigma
              ? probabilityDistribution(
                pnts,
                n,
                config.probabilityDistributionMuRandomness,
                config.probabilityDistributionSigma,
                config.probabilityDistributionSigmaRandomness,
                config.probabilityDistributionNoise,
                config.seed,
              )
              : pnts,
          (pnts: Point[]) => (0 < config.noise ? noise(pnts, n, config.noise, config.seed) : pnts),
          (pnts: Point[]) =>
            config.projection === 'circular' ? toCircularProjection(pnts, config.circlularProjectionFullAngle) : pnts,
          (pnts: Point[]) => smooth(pnts, itemProps.smoothness),
          // after smooth => [..., controlToPrev, linePoint, controlToNext, ...]
          (pnts: Point[]) => transform(pnts, position, itemProps.size, itemProps.angle),
        ].reduce((pnts, fun) => fun(pnts), [] as Point[]);
        const cutRatio0Fun = (i: number) => config.cutRatio0(n, items, size, i);
        const cutRatio1Fun = (i: number) => config.cutRatio1(n, items, size, i);
        svg = drawShapeSvg(cut(points, cutRatio0Fun, cutRatio1Fun), elementStyle);
        boundingBox = PointUtils.boundingBox(points);
      }
      return {
        svg: agg.svg + svg,
        boundingBox: PointUtils.combineBoundingBoxes([agg.boundingBox, boundingBox]),
      };
    },
    { svg: '', boundingBox: PointUtils.DEFAULT_BOUNDING_BOX },
  );
}

function generateShape(edges: number, offset: (i: number) => number): Point[] {
  const pnts: Point[] = [];
  const sectionLength = 1 / edges;
  for (let i = 0; i <= edges; i++) {
    pnts.push([-0.5 + i * sectionLength, offset(i + 1)]);
  }
  return pnts;
}

function probabilityDistribution(
  pnts: Point[],
  n: number,
  muRandomness: number,
  sigma: number,
  sigmaRandomness: number,
  noise: number,
  seed: number,
): Point[] {
  return pnts.map((pnt, i) => {
    const scale = 0.01;
    const pdf = sigma <= 0 ? 0 : generatePdf(pnt[Point.X], muRandomness, sigma, sigmaRandomness, seed + n * 15.07);
    const dy = pdf * scale - noise * pdf * random(0, scale, seed + (n * pnts.length + i) * 1956);
    return [pnt[Point.X], pnt[Point.Y] + dy];
  });
}

function generatePdf(x: number, mu: number, sigma: number, sigmaRandomness: number, seed: number): number {
  const randomMu = random(-mu / 2, mu / 2, seed * 18.05);
  const randomSigma = sigma * random(0.1, 0.1 + sigmaRandomness, seed * 1980);
  // Love will tear us apart //
  return MathUtils.normalPdf(x, randomMu, randomSigma);
}

function noise(pnts: Point[], n: number, noise: number, seed: number): Point[] {
  return pnts.map((pnt, i) => {
    const dy = random(noise * -0.1, noise * 0.1, seed + (n * pnts.length + (i % (pnts.length - 1))));
    return [pnt[Point.X], pnt[Point.Y] + dy];
  });
}

function toCircularProjection(pnts: Point[], fullAngle: number): Point[] {
  return pnts.map((pnt) => {
    const d = pnt[Point.Y] + POLAR_BASE_D;
    const rads = (-(pnt[Point.X] + 0.5) * Math.PI * 2 * fullAngle / 360) - Math.PI / 2;
    return [d * Math.cos(rads), d * Math.sin(rads)];
  });
}

function smooth(pnts: Point[], smoothness: number): Point[] {
  return pnts.reduce((smoothedPnts, pnt, i, arr) => {
    let prevX = 0;
    let prevY = 0;
    let nextX = 0;
    let nextY = 0;

    // performance reasons, although should work as expected for smoothness == 0
    if (0 < smoothness) {
      const n = arr.length - 1;
      const correctionFactor = n === 1 ? 1 : ((2 / 3) * Math.tan(Math.PI / 2 / n)) / Math.sin(Math.PI / n);

      const pntPrev = arr[(i === 0 ? arr.length - 1 : i) - 1];
      const pntNext = arr[(i === arr.length - 1 ? 0 : i) + 1];

      const dX = pntNext[Point.X] - pntPrev[Point.X];
      const dY = pntNext[Point.Y] - pntPrev[Point.Y];
      let rads = Math.atan2(dY, dX);

      const dPrev = smoothness * correctionFactor * PointUtils.distance(pnt, pntPrev);
      const dNext = smoothness * correctionFactor * PointUtils.distance(pnt, pntNext);

      if (arr.length === 3 && i === 1) {
        rads = rads + Math.PI;
      }

      prevX = dPrev * Math.cos(rads + Math.PI);
      prevY = dPrev * Math.sin(rads + Math.PI);
      nextX = dNext * Math.cos(rads);
      nextY = dNext * Math.sin(rads);
    }

    return [
      ...smoothedPnts,
      [pnt[Point.X] + prevX, pnt[Point.Y] + prevY],
      pnt,
      [pnt[Point.X] + nextX, pnt[Point.Y] + nextY],
    ];
  }, [] as Point[]);
}

function transform(points: Point[], origin: Point, size: number, angle: number): Point[] {
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);

  const scaleAndRotate = (pt: Point) => [
    (pt[Point.X] * cos + pt[Point.Y] * sin) * size,
    (-pt[Point.X] * sin + pt[Point.Y] * cos) * size,
  ];
  const absolutePosition = (orig: Point, pt: Point) => [orig[Point.X] + pt[Point.X], orig[Point.Y] - pt[Point.Y]];

  return points.map((pt) => absolutePosition(origin, scaleAndRotate(pt)));
}

function getItemProps(config: ShapeConfig, n: number, items: number, size: number): ItemProps {
  const edges = config.edges;
  const angle = config.angle(n, items, size);
  const smoothness = config.smoothness(n, items, size);
  return { size, edges, angle, smoothness };
}

function cut(pnts: Point[], cutRatio0: (i: number) => number, cutRatio1: (i: number) => number): (Point | undefined)[] {
  const cutPoints: (Point | undefined)[] = [undefined];
  for (let i = 1, j = 1; i < pnts.length; i += 3, j++) {
    const section = pnts.slice(i, i + 4);
    if (cutRatio0(j) < cutRatio1(j) && section.length === 4) {
      cutPoints.push(
        ...sliceBezier(section.slice(0, 4), cutRatio0(j)),
        undefined,
        undefined,
        ...sliceBezier(section.slice(0, 4).reverse(), 1 - cutRatio1(j)),
        undefined,
        undefined,
      );
    } else {
      cutPoints.push(...pnts.slice(i, i + 3));
    }
  }
  return cutPoints;
}

function sliceBezier(pts: Point[], t: number): (Point | undefined)[] {
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

function drawArc(center: Point, size: number, startAngle: number, angle: number, style: string): string {
  if (angle <= -360 || 360 <= angle) {
    return `<circle ${style}  r="${size / 2}"
      cx="${center[Point.X]}" cy="${center[Point.Y]}" />`;
  } else {
    const r = size / 2;
    const startRad = (startAngle / 180) * Math.PI;
    const startPt = [center[Point.X] + Math.cos(startRad) * r, center[Point.Y] + Math.sin(startRad) * r];
    const endRad = ((startAngle + angle) / 180) * Math.PI;
    const endPt = [center[Point.X] + Math.cos(endRad) * r, center[Point.Y] + Math.sin(endRad) * r];
    return `<path ${style} d="${`M ${pointAsSvg(startPt)} A ${r},${r} 0 ${angle % 360 < 180 ? 0 : 1}  1 ${pointAsSvg(
      endPt,
    )}`}" />`;
  }
}

function drawShapeSvg(points: (Point | undefined)[], style: string): string {
  return `<path ${style} d="${points
    .slice(0, -1)
    .reduce((sArr, pnt, i) => {
      if (typeof pnt === 'undefined') {
        if (['M', 'C'].indexOf(sArr[sArr.length - 1]) < 0) {
          return [...sArr, 'M'];
        } else {
          return sArr;
        }
      } else {
        const rtn = [...sArr];
        if (i % 3 === 2) {
          rtn.push('C');
        }
        rtn.push(pointAsSvg(pnt));
        return rtn;
      }
    }, [] as string[])
    .join(' ')}" />`;
}
