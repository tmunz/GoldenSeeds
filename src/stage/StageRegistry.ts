import { Stage } from "./Stage";

export class StageRegistry {

  private registry: Map<string, Map<string, () => Stage<any>>> = new Map();

  register(stageId: string, type: string, stageCreator: () => Stage<any>) {
    if (!this.registry.has(stageId)) {
      this.registry.set(stageId, new Map());
    }
    this.registry.get(stageId).set(type, stageCreator);
  }

  getTypes(stageId: string): string[] {
    return [...this.registry.get(stageId).keys()].sort();
  }

  newInstanceOf(stageId: string, type: string): Stage<any> {
    return this.registry.get(stageId)?.get(type)();
  }
}
