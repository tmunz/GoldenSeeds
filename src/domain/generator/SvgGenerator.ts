type ParamDefinitionTypeMinMaxStep = 'expression' | 'number';

export type ParamDefinitionType = ParamDefinitionTypeMinMaxStep | 'color' | 'selection' | 'string';

export type ParamDefinition = { initial: string } & ({ type: ParamDefinitionType }
  | { type: ParamDefinitionTypeMinMaxStep, min: number, max: number, step: number }
  | { type: 'selection', options: string[] });


export interface SvgGeneratorResult {
  grid: number[][];
  svg: string;
  boundingBox: BoundingBox;
}

export interface SvgGenerator {
  type: string;
  definition: { [key: string]: ParamDefinition }
  generate: (props: object, prev: SvgGeneratorResult) => SvgGeneratorResult;
}