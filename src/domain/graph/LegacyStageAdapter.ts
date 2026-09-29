import { Stage } from '../config/Stage';
import { SvgGeneratorService } from '../generator/SvgGeneratorService';
import { Graph } from './Graph';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';
import { collectParamPorts, paramPortId } from './ParamPorts';

const GRID_PORT = 'grid';
const SVG_PORT = 'svg';
const BOUNDING_BOX_PORT = 'boundingBox';
const RESULT_PORTS = [GRID_PORT, SVG_PORT, BOUNDING_BOX_PORT] as const;

/**
 * Wraps a Stage's generator as a graph node.
 *
 * Instead of a single opaque `in`/`out` port, the three fields of SvgGeneratorResult (grid,
 * svg, boundingBox) are each exposed as their own input and output port, so a node can be
 * fed (or feed downstream nodes) just a boundingBox, or just an svg fragment, independently.
 * In addition, every generator parameter (e.g. style.fillColor, shape.edges, ...) is exposed
 * as its own named input port (see paramPortId). When such a port is connected, the incoming
 * value overrides the Stage's own stored parameter value for that evaluation; when
 * unconnected, the Stage's existing value (as configured in the editor / raw config) is used,
 * so this stays fully backwards compatible with the previous linear pipeline.
 */
export function stageToGraphNode(stage: Stage): GraphNode {
  const paramPorts = collectParamPorts(stage.generator.definition);

  return {
    id: stage.id,
    kind: stage.generator.type,
    inputs: [
      { id: GRID_PORT, type: 'grid' },
      { id: SVG_PORT, type: 'svg' },
      { id: BOUNDING_BOX_PORT, type: 'boundingBox' },
      ...paramPorts.map((p) => ({ id: p.portId, type: p.portType })),
    ],
    outputs: [
      { id: GRID_PORT, type: 'grid' },
      { id: SVG_PORT, type: 'svg' },
      { id: BOUNDING_BOX_PORT, type: 'boundingBox' },
    ],
    config: stage,
    evaluate: (inputs) => {
      const gridInput = inputs[GRID_PORT];
      const svgInput = inputs[SVG_PORT];
      const boundingBoxInput = inputs[BOUNDING_BOX_PORT];
      const prev = {
        grid: gridInput?.type === 'grid' ? gridInput.value : SvgGeneratorService.DEFAULT_RESULT.grid,
        svg: svgInput?.type === 'svg' ? svgInput.value : SvgGeneratorService.DEFAULT_RESULT.svg,
        boundingBox: boundingBoxInput?.type === 'boundingBox' ? boundingBoxInput.value : SvgGeneratorService.DEFAULT_RESULT.boundingBox,
      };

      const config: Record<string, Record<string, unknown>> = {};
      Object.keys(stage.state.data).forEach((groupId) => {
        config[groupId] = {};
        Object.keys(stage.state.data[groupId]).forEach((id) => {
          const connected = inputs[paramPortId(groupId, id)];
          config[groupId][id] = connected !== undefined ? connected.value : stage.state.data[groupId][id].getValue();
        });
      });

      const result = stage.generator.generate(config, prev);
      return {
        [GRID_PORT]: { type: 'grid', value: result.grid },
        [SVG_PORT]: { type: 'svg', value: result.svg },
        [BOUNDING_BOX_PORT]: { type: 'boundingBox', value: result.boundingBox },
      };
    },
  };
}

/** Builds a graph that mirrors the existing linear stage pipeline: stage[i] -> stage[i + 1]. */
export function stagesToGraph(stages: Stage[]): Graph {
  const nodes = stages.map(stageToGraphNode);
  const edges: GraphEdge[] = stages.slice(1).flatMap((stage, i) => connectResultPorts(stages[i].id, stage.id));
  return { nodes, edges };
}

/** Connects all three result ports (grid, svg, boundingBox) of one node to the same-named ports of another. */
export function connectResultPorts(fromNodeId: string, toNodeId: string): GraphEdge[] {
  return RESULT_PORTS.map((port) => ({
    id: `${fromNodeId}.${port}->${toNodeId}.${port}`,
    from: { nodeId: fromNodeId, port },
    to: { nodeId: toNodeId, port },
  }));
}

export const LEGACY_STAGE_PORTS = { GRID_PORT, SVG_PORT, BOUNDING_BOX_PORT, RESULT_PORTS };


