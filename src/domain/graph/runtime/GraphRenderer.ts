import { Graph } from '../model/Graph';
import { graphEvaluator } from './GraphEvaluator';
import { ensureRenderNode, renderNodeResult } from '../nodes/render/RenderNode';
import { svgService } from '../../svg/SvgService';

/** Render the graph's terminal output as a standalone SVG for preview, thumbnails, or export. */
export function renderGraphToSvg(graph: Graph, width: number, height: number, offset = 0): string {
  const { outputsByNode } = graphEvaluator.evaluate(ensureRenderNode(graph));
  return svgService.wrapResult(renderNodeResult(outputsByNode), width, height, offset);
}
