import { Graph } from './Graph';
import { graphEvaluator } from './GraphEvaluator';
import { ensureRenderNode, RENDER_NODE_ID, RENDER_PREVIEW_PORT } from './RenderNode';
import { DEFAULT_GENERATOR_RESULT } from '../generator/SvgGenerator';
import { svgService } from '../svg/SvgService';

/** Render the graph's terminal output as a standalone SVG for preview, thumbnails, or export. */
export function renderGraphToSvg(graph: Graph, width: number, height: number, offset = 0): string {
  const { outputsByNode } = graphEvaluator.evaluate(ensureRenderNode(graph));
  const preview = outputsByNode[RENDER_NODE_ID]?.[RENDER_PREVIEW_PORT];
  const result = preview?.type === 'svgResult' ? preview.value : DEFAULT_GENERATOR_RESULT;
  return svgService.wrapResult(result, width, height, offset);
}
