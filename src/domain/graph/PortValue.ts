
import { BoundingBox } from '../../datatypes/BoundingBox';
import { Color } from '../../datatypes/Color';
import { SvgGeneratorResult } from '../generator/SvgGenerator';
import { Expression } from '../parameter/ExpressionState';
import { ProbabilityDistribution } from '../../datatypes/ProbabilityDistribution';
import type { Font } from 'opentype.js';

export type PortValue =
  // The three fields of SvgGeneratorResult, exposed as their own connectable ports on
  // generator nodes (see GeneratorNode) instead of one opaque combined port. This lets
  // e.g. only the boundingBox (or only the svg fragment) of one node feed another.
  | { type: 'grid'; value: number[][] }
  | { type: 'svg'; value: string | null }
  | { type: 'boundingBox'; value: BoundingBox }
  // Combined result, used only internally by the terminal render node (see RenderNode.ts)
  // to expose "what does this node currently show" in a single evaluated PortValue - never
  // used as a connectable port on generator nodes themselves.
  | { type: 'svgResult'; value: SvgGeneratorResult }
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'color'; value: Color }
  | { type: 'expression'; value: Expression }
  | { type: 'distribution'; value: ProbabilityDistribution }
  | { type: 'font'; value: Font };

export type PortValueType = PortValue['type'];

export interface PortDefinition {
  id: string;
  type: PortValueType;
}
