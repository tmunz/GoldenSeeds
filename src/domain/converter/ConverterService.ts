import { NumberConverter, ColorConverter, ExpressionConverter, StringConverter, SelectionConverter, Converter } from "./";
import { ParamDefinitionType } from "../generator/SvgGenerator";

export class ConverterService {

  private registry: Map<ParamDefinitionType, Converter<any>> = new Map();

  constructor() {
    this.register('color', new ColorConverter());
    this.register('expression', new ExpressionConverter());
    this.register('number', new NumberConverter());
    this.register('selection', new SelectionConverter());
    this.register('string', new StringConverter());
  }

  private register(type: ParamDefinitionType, stageCreator: Converter<any>) {
    this.registry.set(type, stageCreator);
  }

  convert(type: ParamDefinitionType, rawValue: string) {
    return this.registry.get(type).convert(rawValue);
  }

}

export const converterService = new ConverterService();
