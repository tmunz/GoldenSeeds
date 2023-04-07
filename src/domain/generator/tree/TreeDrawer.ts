import { Color } from '../../../datatypes/Color';
import { Tree, Config } from './Tree';
import { Point } from '../../../datatypes/Point';

export interface TreeConfig extends Config {
  style: {
    color: Color,
  }
}

export function draw(config: TreeConfig, grid: Point[]): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p, i) => {
      const tree = new Tree({ ...config, tree: { ...config.tree, seed: config.tree.seed + i } });
      const svg = tree.limbs
        .map(
          (limb) =>
            `<line
            x1="${p[Point.X] + limb.from[Point.X]}"
            y1="${p[Point.Y] - limb.from[Point.Y]}"
            x2="${p[Point.X] + limb.to[Point.X]}"
            y2="${p[Point.Y] - limb.to[Point.Y]}"
            stroke="${config.style.color.toRgbHex(i)}"
            stroke-opacity="${config.style.color.alpha}"
            stroke-width="${Math.pow(config.length.conservation, limb.level) * 5}"
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
