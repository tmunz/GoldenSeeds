import { Color } from '../../../datatypes/Color';
import { Tree, Config } from './Tree';
import { Point } from '../../../datatypes/Point';
import { svgLine } from '../SvgPrimitives';

export interface TreeConfig extends Config {
  style: {
    color: Color;
  };
}

export function draw(config: TreeConfig, points: Point[]): { svg: string; points: Point[] } {
  return points.reduce(
    (agg, p, i) => {
      const tree = new Tree({ ...config, tree: { ...config.tree, seed: config.tree.seed + i } });
      const svg = tree.limbs
        .map((limb) => svgLine(
          [p[Point.X] + limb.from[Point.X], p[Point.Y] - limb.from[Point.Y]],
          [p[Point.X] + limb.to[Point.X], p[Point.Y] - limb.to[Point.Y]],
          config.style.color, i, Math.pow(config.length.conservation, limb.level) * 5,
        ))
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
