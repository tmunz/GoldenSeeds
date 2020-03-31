import { Stage } from "./Stage";
import { CartesianGrid } from "./cartesian";
import { PolarGrid } from "./polar";
import { RegularShape } from "./regularShape";
import { Voronoi } from "./voronoi";
import { Tree } from "./tree";

export class StageRegistry {

  private registry: Map<string, () => Stage> = new Map();

  constructor() {
    this.register('cartesian', () => new CartesianGrid());
    this.register('polar', () => new PolarGrid());

    this.register('regular-shape', () => new RegularShape());
    this.register('voronoi', () => new Voronoi());
    this.register('tree', () => new Tree());
  }

  register(type: string, stageCreator: () => Stage) {
    this.registry.set(type, stageCreator);
  }

  get types(): string[] {
    return [...this.registry.keys()];
  }

  newInstanceOf(type: string): Stage {
    return this.registry.get(type)();
  }
}

export const stageRegistry = new StageRegistry();
