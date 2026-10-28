import { SvgGeneratorResult } from '../generator/SvgGenerator';

export class SvgService {
  /** Center a graph result in a standalone SVG document. */
  wrapResult(result: SvgGeneratorResult, width: number, height: number, offset = 0): string {
    const { min, max } = result.boundingBox;
    const boundingBox = {
      x: min[0], y: min[1], w: max[0] - min[0], h: max[1] - min[1],
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <g transform="${this.centerAndScale(width, height, boundingBox, offset)}">
        ${result.svg ?? ''}
      </g>
    </svg>`;
  }

  private centerAndScale(
    width: number,
    height: number,
    boundingBox: { x: number; y: number; w: number; h: number },
    offset = 0,
  ): string {
    const targetSize = Math.min(width, height) - offset;
    const scale = targetSize / Math.max(boundingBox.w, boundingBox.h);
    const x = width / 2 - (boundingBox.x + boundingBox.w / 2) * scale;
    const y = height / 2 - (boundingBox.y + boundingBox.h / 2) * scale;
    return `translate(${isFinite(x) ? x : 0},${isFinite(y) ? y : 0}) scale(${isFinite(scale) ? scale : 1})`;
  }
}

export const svgService = new SvgService();
