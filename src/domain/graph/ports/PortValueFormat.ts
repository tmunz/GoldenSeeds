import { Locale, translate, Translator } from '../../../i18n/translate';
import { PortValue } from '../model/PortValue';
import { Expression } from '../../parameter/ExpressionState';

/** A short, human-readable preview of a port's current value, shown next to a node's input handles. */
export function formatPortValue(value: PortValue | undefined, t: Translator = translate, locale: Locale = 'en'): string {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, useGrouping: false });
  const formatNumber = (number: number) => {
    const rounded = Number(number.toFixed(2));
    return formatter.format(Object.is(rounded, -0) ? 0 : rounded);
  };
  if (!value) {
    return '';
  }
  switch (value.type) {
  case 'number': return formatNumber(value.value);
  case 'string': return value.value;
  case 'color': return value.value.getAcn();
  case 'expression': return formatExpressionPreview(value.value, formatNumber);
  case 'distribution': return t('preview.distribution', { sigma: formatNumber(value.value.sigma), seed: formatNumber(value.value.seed) });
  case 'font': return value.value?.names.fullName.en ?? '';
  case 'points': return t('preview.points', { count: value.value.length });
  case 'svg': return t(value.value ? 'preview.drawing' : 'preview.empty');
  case 'boundingBox': return `${formatNumber(value.value.max[0] - value.value.min[0])}×${formatNumber(value.value.max[1] - value.value.min[1])}`;
  default: return '';
  }
}

/** Previews an expression by sampling a couple of its outputs (e.g. "1, 3, 5, ...") instead of just naming its type. */
function formatExpressionPreview(expression: Expression, formatNumber: (value: number) => string): string {
  try {
    const samples = [0, 1, 2].map((n) => formatNumber(expression(n, 3, (x) => x, n)));
    return `${samples.join(', ')}, ...`;
  } catch {
    return 'ƒ(n)';
  }
}
