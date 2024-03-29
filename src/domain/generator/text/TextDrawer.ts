import { Font } from 'opentype.js';

import { Color } from '../../../datatypes/Color';
import { Point } from '../../../datatypes/Point';
import { BoundingBox } from '../../../datatypes/BoundingBox';
import { PointUtils } from '../../../utils/PointUtils';

export interface TextDrawerConfig {
  style: {
    color: Color;
    font: Font;
  };
  text: {
    content: string;
    size: (n: number, items: number) => number;
  };
}

export function draw(config: TextDrawerConfig, grid: Point[]): { svg: string; boundingBox: BoundingBox } {
  return grid.reduce(
    (agg, p, n) => {
      const size = config.text.size(n, grid.length);
      const text = drawFont(p, config, size);
      return {
        svg: agg.svg + text.svg,
        boundingBox: PointUtils.combineBoundingBoxes([agg.boundingBox, text.boundingBox]),
      };
    },
    { svg: '', boundingBox: { min: [0, 0] as Point, max: [0, 0] as Point } },
  );
}

function drawFont(p: Point, config: TextDrawerConfig, size: number): { svg: string; boundingBox: BoundingBox } {
  const path = config.style.font.getPath(config.text.content, p[Point.X], p[Point.Y], size, { kerning: true });
  const boundingBox_ = path.getBoundingBox();
  const boundingBox = { min: [boundingBox_.x1, boundingBox_.y1], max: [boundingBox_.x2, boundingBox_.y2] };
  const translateX = -(boundingBox.max[Point.X] - boundingBox.min[Point.X]) / 2;
  const translateY = (boundingBox.max[Point.Y] - boundingBox.min[Point.Y]) / 2;
  const svg = `<path 
    d="${path.toPathData(5)}"
    fill="${config.style.color.getRgbString()}"
    fill-opacity="${config.style.color.getOpacity()}"
    transform="translate(${translateX} ${translateY})"
   />`;
  return {
    svg,
    boundingBox: {
      min: [boundingBox.min[Point.X] + translateX, boundingBox.min[Point.Y] + translateY],
      max: [boundingBox.max[Point.X] + translateX, boundingBox.max[Point.Y] + translateY],
    },
  };
}
