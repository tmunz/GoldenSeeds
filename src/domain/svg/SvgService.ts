import { SvgGeneratorResult } from '../generator/SvgGenerator';
import { Stage } from '../stage/Stage';
import { svgGeneratorService } from '../generator/SvgGeneratorService';
import { PointUtils } from '../../utils/PointUtils';

export class SvgService {
  public generateSvg(stages: Stage[] = [], width: number, height: number) {
    const generatedStages: SvgGeneratorResult[] = [];
    stages.forEach((stage, i) =>
      generatedStages.push(
        svgGeneratorService.getResult(stage, generatedStages[i - 1]),
      ),
    );

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <g transform="${this.centerAndScale(
    width,
    height,
    this.svgBoundingBox(generatedStages),
    140,
  )}">
        ${generatedStages.map((stageResult) => stageResult.svg).join('')}
      </g>
    </svg>`;
  }

  private svgBoundingBox(generatedStages: SvgGeneratorResult[]): {
    x: number;
    y: number;
    w: number;
    h: number;
  } {
    const maxBoundingBox = PointUtils.combineBoundingBoxes(
      generatedStages.map((stage) => stage.boundingBox),
    );
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
    return `translate(${isFinite(x) ? x : 0},${isFinite(y) ? y : 0}) scale(${
      isFinite(scale) ? scale : 1
    })`;
  }
}

export const svgService = new SvgService();
