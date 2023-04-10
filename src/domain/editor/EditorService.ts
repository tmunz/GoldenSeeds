import { ParamDefinitionType, ParamDefinition } from '../generator/SvgGenerator';
import {
  SvgGeneratorInput,
  ColorInput,
  ExpressionInput,
  NumberInput,
  SelectionInput,
  StringInput,
} from '../generatorInput';
import { StageItemState } from '../stage/Stage';
import { SvgGeneratorInputProps } from '../generatorInput/SvgGeneratorInput';

export class EditorService {
  private registry: Map<ParamDefinitionType, SvgGeneratorInput<any>> = new Map();

  constructor() {
    this.register('color', new ColorInput());
    this.register('expression', new ExpressionInput());
    this.register('number', new NumberInput());
    this.register('selection', new SelectionInput());
    this.register('string', new StringInput());
    this.register('font', new StringInput());
  }

  private register(type: ParamDefinitionType, stageCreator: SvgGeneratorInput<any>) {
    this.registry.set(type, stageCreator);
  }

  getInputFieldConfiguration(
    type: ParamDefinitionType,
    id: string,
    definition: ParamDefinition,
    state: StageItemState<any>,
  ): SvgGeneratorInputProps {
    return this.registry.get(type)!.getInputFieldConfiguration(id, definition, state);
  }
}

export const editorService = new EditorService();
