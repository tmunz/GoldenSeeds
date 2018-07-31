import { MathUtils } from "./MathUtils";
import { DrawConfigAttribute, DrawConfig, DrawConfigType } from "../datatypes/DrawConfig";
import { Color } from "../datatypes/Color";

export namespace DrawConfigHelper {

  const convertToExpression = (expression: string, items: number, itemSize?: (n: number) => number): (n: number) => number => {
    return eval(
      `(n) => ((items, fib, goldenRatio, itemSize) => ${expression})`
      + `(${items},${MathUtils.fib},${MathUtils.goldenRatio},${itemSize})`
    );
  }

  export const generateConfigState = (rawConfig: DrawConfig, fallbackConfig: DrawConfig, fallbackScale: number) => {
    let config = { ...rawConfig }
    let isParsableInputs: boolean[] = [];

    //fall back to current config if input is not parsable
    let scale = fallbackScale;
    let itemSize = fallbackConfig.itemSize;

    try {
      itemSize = convertToExpression(DrawConfig.getValue(config, DrawConfigAttribute.ITEM_SIZE), config.items);
      let distance = convertToExpression(DrawConfig.getValue(config, DrawConfigAttribute.DISTANCE), config.items);
      scale = config.size / ((distance(config.items) * 2) + itemSize(config.items));
    } catch {
      // do nothing, itemSize and scale is already set based on last parsable
    }

    Object.keys(DrawConfigAttribute)
      .filter(key => !isNaN(Number(DrawConfigAttribute.fromString(key))))
      .map(attribute => DrawConfigAttribute.fromString(attribute))
      .forEach((attribute: DrawConfigAttribute) => {
        let drawConfigData = convertDrawConfigAttribute(attribute,
          DrawConfig.getValue(config, attribute),
          DrawConfig.getValue(config, DrawConfigAttribute.ITEMS),
          itemSize
        );
        isParsableInputs[attribute] = drawConfigData.isParsable;
        DrawConfig.setValue(config, attribute, isParsableInputs[attribute] ? drawConfigData.value : DrawConfig.getValue(fallbackConfig, attribute));
      });
    return { scale, config, isParsableInputs };
  }

  export const convertDrawConfigAttribute = (attribute: DrawConfigAttribute, value: any, items: number, itemSize: (n: number) => number) => {
    let isParsable: boolean = true;
    let type: DrawConfigType = DrawConfigAttribute.getType(attribute);
    if (type === DrawConfigType.NUMBER_EXPRESSION || type === DrawConfigType.ANGLE_EXPRESSION) {
      try {
        let expression = convertToExpression(value, items, itemSize);
        /*don't check everything because of performance reasons*/
        (Array(Math.min(items, 2)) as any).fill().map((e: any, i: number) => expression(i)); //test Expression 
        value = expression;
      } catch (e) {
        console.error(e);
        isParsable = false;
        /*if (type === DrawConfigType.COLOR_EXPRESSION) {
          let color = Color.convertToColor(value);
          isParsable = color !== null;
          value = isParsable ? color : value;
        }*/
      }
    } else if (type === DrawConfigType.COLOR) {
      let color = Color.convertToColor(value);
      isParsable = color !== null;
      value = isParsable ? color : value
    }
    return new DrawConfigData(value, isParsable);
  }

  class DrawConfigData {
    value: any;
    isParsable: boolean;

    constructor(value: any, isParsable: boolean) {
      this.value = value;
      this.isParsable = isParsable;
    }
  }
}