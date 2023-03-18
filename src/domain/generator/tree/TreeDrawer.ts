import { Color } from '../../../datatypes/Color';
import { Tree, Config as TreeImplConfig } from './Tree';
import { Point } from '../../../datatypes/Point';

export interface TreeConfig extends TreeImplConfig {
  color: Color;
}

export function draw(config: TreeConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p, i) => {
      const tree = new Tree({ ...config, seed: config.seed + i });
      const color = config.color.toString(i);
      const svg = tree.limbs
        .map(
          (limb) =>
            `<line
            x1="${p[Point.X] + limb.from[Point.X]}"
            y1="${p[Point.Y] - limb.from[Point.Y]}"
            x2="${p[Point.X] + limb.to[Point.X]}"
            y2="${p[Point.Y] - limb.to[Point.Y]}"
            stroke="${color}"
            stroke-width="${Math.pow(config.lengthConservation, limb.level) * 5}"
            vector-effect="non-scaling-stroke"
          />`,
        )
        .join('');
      const currentPoints: Point[] = [tree.limbs[0].from, ...tree.limbs.map((l) => l.to)].map((lp) => [
        p[Point.X] + lp[Point.X],
        p[Point.Y] - lp[Point.Y],
      ]);
      return {
        svg: agg.svg + svg,
        points: [...agg.points, ...currentPoints],
      };
    },
    { svg: '', points: [] as Point[] },
  );
}
