import {
  ParamDefinitionType,
  ParamDefinition,
} from '../generator/SvgGenerator';
import {
  SvgGeneratorInput,
  ColorInput,
  ExpressionInput,
  NumberInput,
  SelectionInput,
  StringInput,
} from '../generatorInput';
import { StageState } from '../stage/Stage';

export class EditorService {
  private registry: Map<ParamDefinitionType, SvgGeneratorInput<any>> =
    new Map();

  constructor() {
    this.register('color', new ColorInput());
    this.register('expression', new ExpressionInput());
    this.register('number', new NumberInput());
    this.register('selection', new SelectionInput());
    this.register('string', new StringInput());
  }

  private register(
    type: ParamDefinitionType,
    stageCreator: SvgGeneratorInput<any>,
  ) {
    this.registry.set(type, stageCreator);
  }

  getInputFieldConfiguration(
    type: ParamDefinitionType,
    stageId: string,
    name: string,
    definition: ParamDefinition,
    state: StageState<any>,
  ) {
    return this.registry
      .get(type)
      .getInputFieldConfiguration(stageId, name, definition, state);
  }
}

export const editorService = new EditorService();
