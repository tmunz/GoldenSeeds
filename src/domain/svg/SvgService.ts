import { SvgGeneratorResult } from '../generator/SvgGenerator';
import { BehaviorSubject } from 'rxjs';
import { configService } from '../config/ConfigService';
import { Stage } from '../stage/Stage';
import { svgGeneratorService } from '../generator/SvgGeneratorService';
import { map, filter } from 'rxjs/operators';
import { PointUtils } from '../../utils/PointUtils';

export class SvgService {
  svgContent$ = new BehaviorSubject<string>('');
  width = 1;
  height = 1;

  constructor() {
    configService.config$
      .pipe(filter((value, index) => 1 < index))
      .pipe(map((c) => c.stages))
      .subscribe((stages) =>
        this.setSvgContent(this.width, this.height, stages),
      );
  }

  setSvgContent(width: number, height: number, stages: Stage[] = []) {
    const generatedStages: SvgGeneratorResult[] = [];
    stages.forEach((stage, i) =>
      generatedStages.push(
        svgGeneratorService.getResult(stage, generatedStages[i - 1]),
      ),
    );
    this.svgContent$.next(this.generateSvg(width, height, generatedStages));
  }

  private generateSvg(
    width: number,
    height: number,
    generatedStages: SvgGeneratorResult[],
  ) {
    return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
    >
      <g transform="${this.centerAndScale(
      width,
      height,
      this.svgBoundingBox(generatedStages),
      200,
    )}">
        ${generatedStages.map((stageResult, i) => stageResult.svg)}
      </g>
    </svg>`;
  }

  private svgBoundingBox(generatedStages: SvgGeneratorResult[]): { x: number, y: number, w: number, h: number } {
    const maxBoundingBox = PointUtils.combineBoundingBoxes(generatedStages.map(stage => stage.boundingBox));
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
    boundingBox: { x: number, y: number, w: number, h: number },
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
