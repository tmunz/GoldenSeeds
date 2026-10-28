import { PortValueType } from './PortValue';

/** Deterministic per-port-type accent color used to render Handles in the graph UI. */
const PORT_COLORS: Record<PortValueType, string> = {
  grid: '#d8a657',
  svg: '#decd87',
  boundingBox: '#c9c07c',
  svgResult: '#decd87',
  number: '#4fa3e3',
  string: '#8bd17c',
  color: '#c17ce3',
  expression: '#7ce3d8',
  distribution: '#e39dba',
  font: '#e3e07c',
};

export function portColor(type: PortValueType): string {
  return PORT_COLORS[type] ?? '#999999';
}
