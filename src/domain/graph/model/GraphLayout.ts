export interface GraphPosition {
  x: number;
  y: number;
}

/** UI-only node positions, kept separate from the pure evaluation Graph model. */
export type GraphLayout = Record<string, GraphPosition>;

export const DEFAULT_POSITION: GraphPosition = { x: 0, y: 0 };
export const NODE_GRID_SIZE = 20;
export const GRAPH_RIGHT_MARGIN = NODE_GRID_SIZE * 2;

/** Fixed editor widths, including the compact color and font value nodes. */
export function graphNodeWidth(kind: string): number {
  return kind === 'value:color' || kind === 'value:font' ? 176 : kind.startsWith('value:') ? 240 : 380;
}

/** Load layouts on the dot grid, with room between the rightmost node and the output. */
export function alignGraphLayout(nodes: readonly { id: string; kind: string }[], layout: GraphLayout = {}): GraphLayout {
  const editable = nodes.filter(node => node.kind !== 'render');
  if (!editable.length) { return {}; }
  const snap = (value: number) => Math.round(value / NODE_GRID_SIZE) * NODE_GRID_SIZE;
  const right = Math.max(...editable.map(node =>
    snap((layout[node.id] ?? DEFAULT_POSITION).x) + Math.ceil(graphNodeWidth(node.kind) / NODE_GRID_SIZE) * NODE_GRID_SIZE));
  return Object.fromEntries(editable.map(node => {
    const position = layout[node.id] ?? DEFAULT_POSITION;
    return [node.id, { x: snap(position.x) - right - GRAPH_RIGHT_MARGIN, y: snap(position.y) }];
  }));
}

/** The canvas width is added to x on mount, placing graph x=0 at the right edge. */
export const DEFAULT_VIEWPORT = { x: 0, y: 72, zoom: 0.8 };
