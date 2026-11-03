import { DEFAULT_GENERATOR_RESULT, SvgGeneratorResult } from '../../generator/SvgGenerator';
import { GraphEdge } from '../model/GraphEdge';
import { PortDefinition, PortValue } from '../model/PortValue';

export const RESULT_PORTS: PortDefinition[] = [
  { id: 'points', type: 'points' },
  { id: 'svg', type: 'svg' },
  { id: 'boundingBox', type: 'boundingBox' },
];

/** Combine connected result fields, falling back to the generator defaults. */
export function resultInputs(inputs: Record<string, PortValue | undefined>): SvgGeneratorResult {
  return {
    points: inputs.points?.type === 'points' ? inputs.points.value : DEFAULT_GENERATOR_RESULT.points,
    svg: inputs.svg?.type === 'svg' ? inputs.svg.value : DEFAULT_GENERATOR_RESULT.svg,
    boundingBox: inputs.boundingBox?.type === 'boundingBox' ? inputs.boundingBox.value : DEFAULT_GENERATOR_RESULT.boundingBox,
  };
}

export function connectResultPorts(fromNodeId: string, toNodeId: string): GraphEdge[] {
  return RESULT_PORTS.map(({ id: port }) => ({
    id: `${fromNodeId}.${port}->${toNodeId}.${port}`,
    from: { nodeId: fromNodeId, port },
    to: { nodeId: toNodeId, port },
  }));
}
