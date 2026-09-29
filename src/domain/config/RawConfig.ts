import { GraphEdge } from '../graph/GraphEdge';
import { GraphLayout } from '../graph/GraphLayout';
import { ParamDefinition } from '../generator/SvgGenerator';

/**
 * A single persisted graph node: its id, its node kind (a generator kind like 'shape'/'cartesian',
 * a value kind like 'value:color'/'value:number' - see ValueNodeRegistry - or the terminal 'render'
 * kind - see RenderNode), and, for value nodes only, the raw text value it holds (e.g. a color's
 * ACN string, a number's text, an expression) plus the ParamDefinition (min/max/step, selection
 * options, ...) driving the editor shown on the node (see ValueNodeView) - captured once, either
 * from the originating generator parameter during legacy migration or from the value node's
 * defaults when added from the palette, since a value node is no longer tied to a specific
 * generator parameter once created. Generator nodes carry no inline data of their own - every one
 * of their parameters is meant to be fed by a value node connected via an edge (see
 * GraphSerializer/ParamPorts), instead of being stored as a literal on the node itself.
 */
export interface RawGraphNode {
  id: string;
  kind: string;
  value?: string;
  definition?: ParamDefinition;
}

export interface RawConfig {
  meta: { name: string };
  nodes: RawGraphNode[];
  edges: GraphEdge[];
  layout?: GraphLayout;
}
