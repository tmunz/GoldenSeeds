import { Color } from '../../../datatypes/Color';
import { Tree, Config as TreeImplConfig } from './Tree';
import { Point } from './Point';

export interface TreeConfig extends TreeImplConfig {
  color: Color;
}

export function draw(
  config: TreeConfig,
  grid: number[][],
): { svg: string; points: Point[] } {
  return grid.reduce(
    (agg, p, i) => {
      const tree = new Tree({ ...config, seed: config.seed + i });
      const color = config.color.toString(i);
      const svg = tree.limbs
        .map(
          (limb) =>
            `<line
        x1="${p[0] + limb.from.x}"
        y1="${p[1] - limb.from.y}"
        x2="${p[0] + limb.to.x}"
        y2="${p[1] - limb.to.y}"
        stroke="${color}"
        stroke-width="${Math.pow(config.lengthConservation, limb.level) * 5}"
        vector-effect="non-scaling-stroke"
      />`,
        )
        .join('');
      const currentPoints: Point[] = [
        tree.limbs[0].from,
        ...tree.limbs.map((l) => l.to),
      ].map((lp) => ({ x: p[0] + lp.x, y: p[1] - lp.y }));
      return {
        svg: agg.svg + svg,
        points: [...agg.points, ...currentPoints],
      };
    },
    { svg: '', points: [] as Point[] },
  );
}
