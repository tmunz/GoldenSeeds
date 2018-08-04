import { Color } from "./Color";

export enum DrawConfigAttribute {
  NAME, TYPE, SIZE, STYLE,
  BACKGROUND_COLOR, ANGLE, DISTANCE,
  ITEMS, ITEM_CORNERS, ITEM_COLOR, ITEM_ANGLE, ITEM_SIZE, ITEM_RATIO, CUT_RATIO_0, CUT_RATIO_1,
}

export namespace DrawConfigAttribute {

  export const toString = (attribute: DrawConfigAttribute): string => {
    return DrawConfigAttribute[attribute];
  }

  export const fromString = (attribute: string): DrawConfigAttribute => {
    return Number(DrawConfigAttribute[attribute.toUpperCase() as any]);
  }

  export const getType = (attribute: DrawConfigAttribute): DrawConfigType => {
    switch (attribute) {
      case DrawConfigAttribute.STYLE:
        return DrawConfigType.OBJECT;

      case DrawConfigAttribute.ITEMS:
      case DrawConfigAttribute.SIZE:
      case DrawConfigAttribute.ITEM_CORNERS:
        return DrawConfigType.NUMBER;

      case DrawConfigAttribute.BACKGROUND_COLOR:
        return DrawConfigType.COLOR;

      case DrawConfigAttribute.ITEM_COLOR:
        return DrawConfigType.COLOR//_EXPRESSION;

      case DrawConfigAttribute.DISTANCE:
      case DrawConfigAttribute.ITEM_SIZE:
      case DrawConfigAttribute.ITEM_RATIO:
      case DrawConfigAttribute.CUT_RATIO_0:
      case DrawConfigAttribute.CUT_RATIO_1:
        return DrawConfigType.NUMBER_EXPRESSION;

      case DrawConfigAttribute.ITEM_ANGLE:
      case DrawConfigAttribute.ANGLE:
        return DrawConfigType.ANGLE_EXPRESSION;

      case DrawConfigAttribute.TYPE:
        return DrawConfigType.ENUM;

      default:
        return DrawConfigType.STRING;
    }
  }
}

export enum DrawType {
  FILLED, STROKE
}

export namespace DrawType {
  export const toString = (attribute: DrawType): string => {
    return DrawType[attribute];
  }

  export const fromString = (attribute: string): DrawType => {
    return Number(DrawType[attribute.toUpperCase() as any]);
  }
}

export enum DrawConfigType {
  STRING, NUMBER, NUMBER_EXPRESSION, ANGLE_EXPRESSION, COLOR, OBJECT, ENUM
}



export class DrawConfig {

  name: string = 'new';
  type: DrawType = DrawType.FILLED;
  size: number = 600;
  style: {} = {};

  backgroundColor: Color = new Color('golden');
  angle: (n: number) => number = (n: number) => n;
  distance: (n: number) => number = (n: number) => n;

  items: number = 1;
  itemCorners: number = 0;
  itemColor: /*(n: number) =>*/ Color = new Color('black');
  itemAngle: (n: number) => number = (n: number) => 0;
  itemSize: (n: number) => number = (n: number) => 1;
  itemRatio: (n: number) => number = (n: number) => 0.5;
  cutRatio0: (n: number) => number = (n: number) => 0;
  cutRatio1: (n: number) => number = (n: number) => 0;

  static getVariableIdentifier = (attribute: DrawConfigAttribute): string => {
    return DrawConfigAttribute[attribute].toLowerCase().replace(/_./g, s => s.toUpperCase().charAt(1));
  }

  static getValue = (config: DrawConfig, attribute: DrawConfigAttribute): any => {
    return (config as any)[DrawConfig.getVariableIdentifier(attribute)]; //WARN: typewise dangerous but elegant
  }

  static setValue = (config: DrawConfig, attribute: DrawConfigAttribute, value: any) => {
    (config as any)[DrawConfig.getVariableIdentifier(attribute)] = value; //WARN: typewise dangerous but elegant
  }

  static getName = (attribute: DrawConfigAttribute): string => {
    return DrawConfigAttribute[attribute].replace(/_/g, ' ').toLowerCase();
  }

  static import = (raw: any): DrawConfig => {
    let config = {
      ... new DrawConfig(), ...raw,
      type: DrawType.fromString(raw.type),
    }
    return config;
  }

  static export = (config: DrawConfig): any => {
    let raw = {
      ... new DrawConfig(), ...config,
      type: DrawType.toString(config.type).toLowerCase(),
    }
    return raw;
  }
}