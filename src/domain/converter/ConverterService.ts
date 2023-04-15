import { NumberConverter, ColorConverter, ExpressionConverter, StringConverter, Converter, FontConverter } from './';
import { ParamDefinitionType } from '../generator/SvgGenerator';
import { StageItemState } from '../stage/Stage';

export class ConverterService {
  private registry: Map<ParamDefinitionType, Converter<any>> = new Map();

  constructor() {
    this.register('color', new ColorConverter());
    this.register('expression', new ExpressionConverter());
    this.register('number', new NumberConverter());
    this.register('selection', new StringConverter());
    this.register('string', new StringConverter());
    this.register('font', new FontConverter());
  }

  private register(type: ParamDefinitionType, stageCreator: Converter<any>) {
    this.registry.set(type, stageCreator);
  }

  convertTextToValue(type: ParamDefinitionType, textValue: string): Promise<Partial<StageItemState<any>>> {
    return this.registry.get(type)!.convert(textValue);
  }
}

export const converterService = new ConverterService();
