import { Stage } from "./Stage";
import { CartesianGrid } from "./types/cartesian";
import { PolarGrid } from "./types/polar";
import { RegularShape } from "./types/regularShape";
import { Voronoi } from "./types/voronoi";
import { Tree } from "./types/tree";

export class StageRegistry {

  private registry: Map<string, () => Stage> = new Map();

  constructor() {
    const classes = [CartesianGrid, PolarGrid, RegularShape, Voronoi, Tree];
    classes.forEach(c => this.register(c.type, () => new c()))
    /*
    this.register('cartesian', () => new CartesianGrid());
    this.register('polar', () => new PolarGrid());
    this.register('regular-shape', () => new RegularShape());
    this.register('voronoi', () => new Voronoi());
    this.register('tree', () => new Tree());
    */
  }

  register(type: string, stageCreator: () => Stage) {
    this.registry.set(type, stageCreator);
  }

  get types(): string[] {
    return [...this.registry.keys()];
  }

  newInstance(type: string, intitialState?: { [key: string]: string }): Stage {
    return this.registry.get(type)().withState(intitialState);
  }
}

export const stageRegistry = new StageRegistry();
