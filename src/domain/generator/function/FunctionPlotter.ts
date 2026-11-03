import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';
import { fillAttributes, polylinePathData, strokeAttributes } from '../SvgPrimitives';

export interface FunctionPlotterConfig {
  style: {
    fillColor: Color;
    strokeColor: Color;
    strokeWidth: (n: number, items: number) => number;
    resolution: number;
  };
  plot: {
    items: number;
    start: number;
    functionX: (n: number, items: number) => number | number[];
    functionY: (n: number, items: number) => number | number[];
  };
}

export function plot(config: FunctionPlotterConfig, points: Point[]): { svg: string; points: Point[] } {
  return points.reduce(
    (agg, p, j) => {
      const coordinates = calculateFunctionPlot(
        p,
        config.plot.start,
        config.plot.items,
        config.plot.functionX,
        config.plot.functionY,
        config.style.resolution,
      );
      const svg = `<path
        ${fillAttributes(config.style.fillColor, j)}
        ${strokeAttributes(config.style.strokeColor, j, config.style.strokeWidth(j, config.plot.items))}
        d="${polylinePathData(coordinates.highResolution)}" />`;
      return {
        svg: agg.svg + svg,
        points: [...agg.points, ...coordinates.mainPoints],
      };
    },
    { svg: '', points: [] as Point[] },
  );
}

function calculateFunctionPlot(
  center: Point,
  start: number,
  items: number,
  funX: (n: number, items: number) => number | number[],
  funY: (n: number, items: number) => number | number[],
  resolution: number,
): { mainPoints: Point[]; highResolution: Point[] } {
  if (resolution <= 0) { return { mainPoints: [], highResolution: [] }; }
  const mainPoints: Point[] = [];
  const highResolution: Point[] = [];
  for (let n = 0; n <= (items - 1) * resolution; n++) {
    const value = start + n / resolution;
    let x = funX(value, items);
    let y = funY(value, items);
    if (Array.isArray(x)) {
      x = x[Math.floor(start + n / resolution)] ?? 0;
    }
    if (Array.isArray(y)) {
      y = y[Math.floor(start + n / resolution)] ?? 0;
    }
    const p = [center[Point.X] + x, center[Point.Y] - y];
    highResolution.push(p);
    if (n % resolution === 0) {
      mainPoints.push(p);
    }
  }
  return { mainPoints, highResolution };
}
