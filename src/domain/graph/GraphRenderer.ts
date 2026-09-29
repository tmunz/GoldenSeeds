import { Graph } from './Graph';
import { graphEvaluator } from './GraphEvaluator';
import { ensureRenderNode, RENDER_NODE_ID, RENDER_PREVIEW_PORT } from './RenderNode';
import { SvgGeneratorService } from '../generator/SvgGeneratorService';
import { svgService } from '../svg/SvgService';

/**
 * Evaluates a graph and wraps its terminal render node's combined result (see RenderNode.ts)
 * into a standalone `<svg>` document, sized/centered to fit width x height. Used for SVG/PNG
 * export and for the config manager's stored thumbnail, the graph-native equivalent of the
 * old linear pipeline's SvgService.generateSvg(stages, ...).
 */
export function renderGraphToSvg(graph: Graph, width: number, height: number, offset = 0): string {
  const { outputsByNode } = graphEvaluator.evaluate(ensureRenderNode(graph));
  const preview = outputsByNode[RENDER_NODE_ID]?.[RENDER_PREVIEW_PORT];
  const result = preview?.type === 'svgResult' ? preview.value : SvgGeneratorService.DEFAULT_RESULT;
  return svgService.wrapResults([result], width, height, offset);
}
