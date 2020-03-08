import { Converter } from "./Converter";
import { StageState } from "../Config";
import { InputType } from "../ui/input/Input";

export class ListConverter<T> extends Converter<string> {

  private list: T[];

  constructor(name: string, list: T[]) {
    super(name, { min: 0, max: list.length - 1, step: 1 });
    this.list = list;
  }

  inputConfig = (stage: string, configItem: StageState<string>) => {
    return { 
      inputType: InputType.RANGE, 
      canExpertMode: false,
      textValue: configItem.rawValue,
      convertToString: (i: number) => this.list[i],
      rangeValue: this.list.findIndex(s => s.toString() === configItem.rawValue),
    };
  }

  protected convertFromRaw = (rawValue: string): string => {
    return rawValue;
  }
}
