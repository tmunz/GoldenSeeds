export interface GraphPosition {
  x: number;
  y: number;
}

/** UI-only node positions, kept separate from the pure evaluation Graph model. */
export type GraphLayout = Record<string, GraphPosition>;

export const DEFAULT_POSITION: GraphPosition = { x: 0, y: 0 };

/** Start at a readable scale with room above the network for the node palette. */
export const DEFAULT_VIEWPORT = { x: 32, y: 72, zoom: 0.8 };
