import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';

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
    output: string;
  };
}

export function plot(config: FunctionPlotterConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
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
        fill="${config.style.fillColor.toRgbHex(j)}"
        fill-opacity="${config.style.fillColor.alpha}"
        stroke="${config.style.strokeColor.toRgbHex(j)}"
        stroke-opacity="${config.style.strokeColor.alpha}"
        stroke-width="${config.style.strokeWidth(j, config.plot.items)}"
        vector-effect="non-scaling-stroke"
        d="${coordinates.highResolution.reduce((s: string, point: Point, i: number) => {
    if (i === 0) {
      return `M ${point[Point.X]}, ${point[Point.Y]} `;
    } else {
      return `${s} L ${point[Point.X]}, ${point[Point.Y]} `;
    }
  }, '')}" />`;
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
