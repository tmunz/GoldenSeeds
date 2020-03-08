import { Grid } from "./Grid";
import { NumberConverter } from "../../converter";

export class CartesianGrid extends Grid {

  type = "cartesian";

  initialState = {
    x: "5",
    items: "20",
  }

  converter = {
    x: new NumberConverter("x", { min: 1, max: 25, step: 1 }),
    items: new NumberConverter("items", { min: 1, max: 625, step: 1 }),
  };

  generate = ({ x, items }: { x: number, items: number }) => {
    const result = [];
    for (let i = 0; i < items; i++) {
      result.push([i % x, Math.floor(i / x)]);
    }
    return { result, boundingBox: { x: 0, y: 0, w: x - 1, h: Math.ceil(items / x) - 1} };
  }
}
