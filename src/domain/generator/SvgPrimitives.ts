import { Color } from '../../datatypes/Color';
import { Point } from '../../datatypes/Point';

/** Stroke attributes; `n` seeds random colors. */
export function strokeAttributes(color: Color, n: number, width: number): string {
  return `stroke="${color.getRgbString(n)}"
    stroke-opacity="${color.getOpacity()}"
    stroke-width="${width}"
    vector-effect="non-scaling-stroke"`;
}

export function fillAttributes(color: Color, n: number): string {
  return `fill="${color.getRgbString(n)}"
    fill-opacity="${color.getOpacity()}"`;
}

export function svgLine(from: Point, to: Point, color: Color, n: number, width: number): string {
  return `<line
    x1="${from[Point.X]}"
    y1="${from[Point.Y]}"
    x2="${to[Point.X]}"
    y2="${to[Point.Y]}"
    ${strokeAttributes(color, n, width)}
  />`;
}

/** Path data connecting the points with straight segments. */
export function polylinePathData(points: Point[], closed = false): string {
  const data = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[Point.X]}, ${point[Point.Y]}`).join(' ');
  return closed ? `${data} z` : data;
}
