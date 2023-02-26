import { SvgGeneratorResult } from "../generator/SvgGenerator";
import { BehaviorSubject, never } from "rxjs";
import { configService } from "../config/ConfigService";
import { Stage } from "../stage/Stage";
import { svgGeneratorService } from "../generator/SvgGeneratorService";
import { map, filter } from "rxjs/operators";

export class SvgService {

  svgContent$ = new BehaviorSubject<string>('');
  width: number = 1;
  height: number = 1;

  constructor() {
    configService.config$
      .pipe(filter((value, index) => 1 < index))
      .pipe(map(c => c.stages))
      .subscribe(stages => this.setSvgContent(this.width, this.height, stages)
    );
  }

  setSvgContent(width: number, height: number, stages: Stage[] = []) {
    const generatedStages: SvgGeneratorResult[] = [];
    stages.forEach((stage, i) =>
      generatedStages.push(svgGeneratorService.getResult(stage, generatedStages[i - 1]))
    );
    this.svgContent$.next(this.generateSvg(width, height, generatedStages));
  }

  private generateSvg(width: number, height: number, generatedStages: SvgGeneratorResult[]) {
    return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
    >
      <g transform="${this.centerAndScale(width, height, this.boundingBox(generatedStages), 200)}">
        ${generatedStages.map((stageResult, i) => stageResult.svg)}
      </g>
    </svg>`;
  }

  private boundingBox(generatedStages: SvgGeneratorResult[]): BoundingBox {
    const extremePoints = generatedStages.reduce((b, stage) => ({
      x1: Math.min(stage.boundingBox.x, b.x1),
      y1: Math.min(stage.boundingBox.y, b.y1),
      x2: Math.max(stage.boundingBox.x + stage.boundingBox.w, b.x2),
      y2: Math.max(stage.boundingBox.y + stage.boundingBox.h, b.y2),
    }), { x1: 0, y1: 0, x2: 0, y2: 0 });
    return {
      x: extremePoints.x1,
      y: extremePoints.y1,
      w: extremePoints.x2 - extremePoints.x1,
      h: extremePoints.y2 - extremePoints.y1,
    }
  }

  private centerAndScale(width: number, height: number, boundingBox: BoundingBox, offset = 0): string {
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