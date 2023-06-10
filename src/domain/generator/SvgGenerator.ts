import { BoundingBox } from '../../datatypes/BoundingBox';

type ParamDefinitionTypeMinMaxStep = 'expression' | 'number';
export type ParamDefinitionType = ParamDefinitionTypeMinMaxStep | 'color' | 'selection' | 'string' | 'font';
export type ParamDefinitionMinMaxStep = {
  type: ParamDefinitionTypeMinMaxStep;
  min: number;
  max: number;
  step: number;
};
export type ParamDefinitionSelection = { type: 'selection'; options: string[] };

export type ParamDefinition = { initial: string; animateable?: boolean } & (
  | { type: ParamDefinitionType }
  | ParamDefinitionMinMaxStep
  | ParamDefinitionSelection
);

export interface SvgGeneratorResult {
  grid: number[][];
  svg: string | null;
  boundingBox: BoundingBox;
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
