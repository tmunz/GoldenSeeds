import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { createParameterState } from '../parameter/CreateParameterState';
import { createGeneratorNode, GeneratorNodeConfig } from './GeneratorNode';
import { GraphNode } from './GraphNode';

/** Exposes registered SVG generators as graph nodes with typed parameter inputs. */
export class GeneratorNodeRegistry {
  get kinds(): string[] {
    return svgGeneratorRegistry.types;
  }

  async createNode(kind: string, id: string, data?: Record<string, Record<string, string>>): Promise<GraphNode<GeneratorNodeConfig>> {
    const generator = svgGeneratorRegistry.newInstance(kind);
    if (!generator) {
      throw new Error(`Unknown generator kind: ${kind}`);
    }
    const parameters: GeneratorNodeConfig['parameters'] = {};
    await Promise.all(Object.entries(generator.definition).map(async ([groupId, group]) => {
      parameters[groupId] = {};
      await Promise.all(Object.entries(group).map(async ([id, definition]) => {
        parameters[groupId][id] = await createParameterState(definition.type, data?.[groupId]?.[id] ?? definition.initial);
      }));
    }));
    return createGeneratorNode(id, { generator, parameters });
  }
}

export const generatorNodeRegistry = new GeneratorNodeRegistry();
