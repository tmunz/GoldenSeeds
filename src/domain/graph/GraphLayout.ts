export interface GraphPosition {
  x: number;
  y: number;
}

/** UI-only node positions, kept separate from the pure evaluation Graph model. */
export type GraphLayout = Record<string, GraphPosition>;

export const DEFAULT_POSITION: GraphPosition = { x: 0, y: 0 };
