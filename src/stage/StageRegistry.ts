import { Stage } from "./Stage";

export class StageRegistry {

  private registry: Map<string, () => Stage> = new Map();

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
