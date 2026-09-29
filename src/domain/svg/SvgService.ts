import { SvgGeneratorResult } from '../generator/SvgGenerator';
import { PointUtils } from '../../utils/PointUtils';

export class SvgService {
  /**
   * Wraps one or more already-generated SvgGeneratorResults into a single, standalone
   * `<svg>` document, sized to width/height and centered/scaled to fit their combined
   * bounding box. Used by the graph render node (see RenderNode.ts/RenderNodeView.tsx and
   * GraphRenderer.ts), whose PortValue only carries the raw per-node svg fragment plus
   * bounding box - not a displayable standalone document.
   */
  public wrapResults(results: SvgGeneratorResult[], width: number, height: number, offset = 0): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <g transform="${this.centerAndScale(width, height, this.svgBoundingBox(results), offset)}">
        ${results.map((stageResult) => stageResult.svg ?? '').join('')}
      </g>
    </svg>`;
  }


  private svgBoundingBox(generatedStages: SvgGeneratorResult[]): {
    x: number;
    y: number;
    w: number;
    h: number;
  } {
    const maxBoundingBox = PointUtils.combineBoundingBoxes(generatedStages.map((stage) => stage.boundingBox));
    return {
      x: maxBoundingBox.min[0],
      y: maxBoundingBox.min[1],
      w: maxBoundingBox.max[0] - maxBoundingBox.min[0],
      h: maxBoundingBox.max[1] - maxBoundingBox.min[1],
    };
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
