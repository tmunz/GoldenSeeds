import { PortValueType } from './PortValue';

/** Deterministic per-port-type accent color used to render Handles in the graph UI. */
export const PORT_COLORS: Record<PortValueType, string> = {
  grid: '#d8a657',
  svg: '#decd87',
  boundingBox: '#c9c07c',
  svgResult: '#decd87',
  number: '#4fa3e3',
  string: '#8bd17c',
  boolean: '#e37c7c',
  color: '#c17ce3',
  point: '#e3b97c',
  expression: '#7ce3d8',
  font: '#e3e07c',
};

export function portColor(type: PortValueType): string {
  return PORT_COLORS[type] ?? '#999999';
}
