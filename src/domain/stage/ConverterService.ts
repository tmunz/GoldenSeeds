import { Converter } from "./converter/Converter";
import { StageItemType } from "./StageItemType";
import { NumberConverter, ColorConverter, ExpressionConverter, StringConverter, SelectionConverter } from "./converter";

export class ConverterService {

  private registry: Map<StageItemType, Converter<any>> = new Map();

  constructor() {
    this.register('color', new ColorConverter());
    this.register('expression', new ExpressionConverter());
    this.register('number', new NumberConverter());
    this.register('selection', new SelectionConverter());
    this.register('string', new StringConverter());
  }

  private register(type: StageItemType, stageCreator: Converter<any>) {
    this.registry.set(type, stageCreator);
  }

  convert(type: StageItemType, rawValue: string) {
    return this.registry.get(typeof type === 'string' ? type : type.name).convert(rawValue);
  }

}

export const converterService = new ConverterService();
