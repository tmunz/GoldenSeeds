import { PointUtils } from '../../utils/PointUtils';
import { BoundingBox } from '../../datatypes/BoundingBox';

type ParamBase = { initial: string; animateable?: boolean };
type RangeDefinition = { min?: number; max?: number; step?: number };
export type ParamDefinitionMinMaxStep = ParamBase & RangeDefinition & (
  | { type: 'number'; validate?: (value: number) => boolean }
  | { type: 'expression' }
);
export type ParamDefinitionSelection = ParamBase & { type: 'selection'; options: string[] };
export type ParamDefinition =
  | ParamDefinitionMinMaxStep
  | ParamDefinitionSelection
  | (ParamBase & { type: 'color' | 'string' | 'font' | 'distribution' });
export type ParamDefinitionType = ParamDefinition['type'];

export interface SvgGeneratorResult {
  points: number[][];
  svg: string | null;
  boundingBox: BoundingBox;
}

export const DEFAULT_GENERATOR_RESULT: SvgGeneratorResult = {
  points: [[0, 0]],
  svg: null,
  boundingBox: PointUtils.DEFAULT_BOUNDING_BOX,
};

/** Result of a generator that emits new points: they replace the previous ones and extend the bounding box. */
export function withDrawnPoints(
  prev: SvgGeneratorResult,
  drawing: { svg: string; points: number[][] },
  drawingBoundingBox: BoundingBox = PointUtils.boundingBox(drawing.points),
): SvgGeneratorResult {
  return {
    points: drawing.points,
    svg: drawing.svg,
    boundingBox: PointUtils.combineBoundingBoxes([prev.boundingBox, drawingBoundingBox]),
  };
}

export abstract class SvgGenerator<T> {
  type: string;
  definition: Record<string, Record<string, ParamDefinition>>;

  constructor(type: string, definition: Record<string, Record<string, ParamDefinition>>) {
    this.type = type;
    this.definition = definition;
  }

  abstract generate(config: T, prev: SvgGeneratorResult): SvgGeneratorResult;
}
