import { Stage } from '../config/Stage';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { GraphNode } from './GraphNode';
import { stageToGraphNode } from './LegacyStageAdapter';

/**
 * Registry that exposes every existing SvgGenerator (shape, cartesian, polar, voronoi,
 * tree, text, function) as a node kind that can be dropped into a Graph.
 *
 * Each created node has a single `in`/`out` port of type `svgResult`, matching the
 * current generators' `generate(config, prev): SvgGeneratorResult` signature. Generator
 * specific parameters (color, number, expression, ...) stay on `node.config` (the
 * underlying Stage) and are not (yet) exposed as separate graph ports.
 */
export class GeneratorNodeRegistry {

  /** All node kinds that can be created, e.g. 'shape', 'cartesian', 'polar', 'voronoi', 'tree', 'text', 'function'. */
  get kinds(): string[] {
    return svgGeneratorRegistry.types;
  }

  /**
   * Creates a graph node for the given generator kind.
   * @param kind one of `this.kinds`
   * @param id unique node id within the graph
   * @param data optional raw (text) parameter overrides, keyed by group then param id
   * @param name optional display name for the node
   */
  async createNode(
    kind: string,
    id: string,
    data?: Record<string, Record<string, string>>,
    name?: string,
  ): Promise<GraphNode> {
    const generator = svgGeneratorRegistry.newInstance(kind);
    if (!generator) {
      throw new Error(`Unknown generator kind: ${kind}`);
    }
    const stage = await new Stage(id, name).with(generator, data);
    return stageToGraphNode(stage);
  }

  /** Creates a node using the registry's default generator kind (currently 'shape'). */
  async createDefaultNode(id: string, name?: string): Promise<GraphNode> {
    const generator = svgGeneratorRegistry.getDefaultGenerator();
    const stage = await new Stage(id, name).with(generator);
    return stageToGraphNode(stage);
  }
}

export const generatorNodeRegistry = new GeneratorNodeRegistry();
