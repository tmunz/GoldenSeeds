import { PortValue } from './PortValue';
import { Expression } from '../config/stageItemState/ExpressionState';

/** A short, human-readable preview of a port's current value, shown next to a node's input handles. */
export function formatPortValue(value: PortValue | undefined): string {
  if (!value) {
    return '';
  }
  switch (value.type) {
  case 'number': return value.value.toString();
  case 'string': return value.value;
  case 'boolean': return value.value ? 'true' : 'false';
  case 'color': return value.value.getAcn();
  case 'point': return value.value.toString();
  case 'expression': return formatExpressionPreview(value.value);
  case 'font': return value.value?.names.fullName.en ?? '';
  case 'grid': return `${value.value.length} rows`;
  case 'svg': return value.value ? 'svg' : 'empty';
  case 'boundingBox': return `${value.value.max[0] - value.value.min[0]}×${value.value.max[1] - value.value.min[1]}`;
  default: return '';
  }
}

/** Previews an expression by sampling a couple of its outputs (e.g. "1, 3, 5, ...") instead of just naming its type. */
function formatExpressionPreview(expression: Expression): string {
  try {
    const samples = [0, 1, 2].map((n) => expression(n, 3, (x) => x, n));
    return `${samples.join(', ')}, ...`;
  } catch {
    return 'ƒ(n)';
  }
}
