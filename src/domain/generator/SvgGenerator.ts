type ParamDefinitionTypeMinMaxStep = 'expression' | 'number';

export type ParamDefinitionType =
  | ParamDefinitionTypeMinMaxStep
  | 'color'
  | 'selection'
  | 'string';
export type ParamDefinitionMinMaxStep = {
  type: ParamDefinitionTypeMinMaxStep;
  min: number;
  max: number;
  step: number;
};
export type ParamDefinitionSelection = { type: 'selection'; options: string[] };

export type ParamDefinition = { initial: string } & (
  | { type: ParamDefinitionType }
  | ParamDefinitionMinMaxStep
  | ParamDefinitionSelection
);

export interface SvgGeneratorResult {
  grid: number[][];
  svg: string | null;
  boundingBox: BoundingBox;
}

export interface SvgGenerator {
  type: string;
  definition: { [key: string]: ParamDefinition };
  generate: (props: object, prev: SvgGeneratorResult) => SvgGeneratorResult;
}
