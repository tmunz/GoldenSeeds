type StageItemTypeMinMaxStep = 'expression' | 'number';
type StageItemTypeSimple = StageItemTypeMinMaxStep | 'color' | 'selection' | 'string';

export type StageItemType = StageItemTypeSimple | { name: StageItemTypeSimple }
  | { name: StageItemTypeMinMaxStep, min: number, max: number, step: number }
  | { name: 'selection', options: string[] };