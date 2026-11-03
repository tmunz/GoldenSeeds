import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nProvider, useTranslation } from './I18n';
import { createTranslator, isLocale } from './translate';
import { en } from './en';
import { de } from './de';
import { svgGeneratorRegistry } from '../domain/generator/SvgGeneratorRegistry';
import { RESULT_PORTS } from '../domain/graph/runtime/GraphResult';
import { DEFAULT_VALUE_DEFINITIONS } from '../domain/graph/nodes/value/ValueNodeRegistry';
import { DISTRIBUTION_FIELDS } from '../datatypes/ProbabilityDistribution';
import { formatPortValue } from '../domain/graph/ports/PortValueFormat';

function Labels() {
  const { t, locale } = useTranslation();
  return <p lang={locale}>{t('ports.points')} / {t('parameters.strokeWidth')} / {t('graph.add')}</p>;
}

test('provider supplies localized labels while standalone components default to English', () => {
  expect(renderToStaticMarkup(<Labels />)).toContain('Points / stroke width / Add node');
  expect(renderToStaticMarkup(<I18nProvider initialLocale="de"><Labels /></I18nProvider>))
    .toContain('<p lang="de">Punkte / Linienbreite / Knoten hinzufügen</p>');
});

test('catalogs cover every registered generator, parameter, option, port, and value type', () => {
  const required = [
    ...RESULT_PORTS.map(port => `ports.${port.id}`),
    ...Object.keys(DEFAULT_VALUE_DEFINITIONS).map(type => `ports.${type}`),
    ...DISTRIBUTION_FIELDS.map(field => `parameters.${field}`),
  ];
  for (const kind of svgGeneratorRegistry.types) {
    required.push(`generators.${kind}`);
    const generator = svgGeneratorRegistry.newInstance(kind);
    if (!generator) { throw new Error(`Unknown generator ${kind}`); }
    for (const [group, parameters] of Object.entries(generator.definition)) {
      required.push(`groups.${group}`);
      for (const [id, definition] of Object.entries(parameters)) {
        required.push(`parameters.${id}`);
        if (definition.type === 'selection') {
          required.push(...definition.options.map(option => `options.${option}`));
        }
      }
    }
  }
  for (const locale of ['en', 'de'] as const) {
    const t = createTranslator(locale);
    for (const key of required) { expect(t(key)).not.toBe(key); }
  }
  expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
});

test('messages support interpolation, plurals, and explicit fallbacks without formatting identifiers', () => {
  const t = createTranslator('de');
  expect(t('graph.deleteNode', { name: 'Voronoi' })).toBe('Knoten Voronoi löschen');
  expect(t('preview.points', { count: 1 })).toBe('1 Punkt');
  expect(t('preview.points', { count: 2 })).toBe('2 Punkte');
  expect(createTranslator('en')('preview.points', { count: 1 })).toBe('1 point');
  expect(t('plugins.customNode', {}, 'customNode')).toBe('customNode');
  expect(t('missing.key')).toBe('missing.key');
});

test('translated numeric previews retain the two-decimal limit and full underlying precision', () => {
  const value = { min: [-0.123456, 0], max: [10, 20.98765] };
  expect(formatPortValue({ type: 'boundingBox', value }, createTranslator('de'), 'de')).toBe('10,12×20,99');
  expect(formatPortValue({ type: 'points', value: [[0, 0]] }, createTranslator('de'), 'de')).toBe('1 Punkt');
  expect(value.min[0]).toBe(-0.123456);
});

test('only supported language identifiers are accepted', () => {
  expect(isLocale('de')).toBe(true);
  expect(isLocale('en')).toBe(true);
  expect(isLocale('fr')).toBe(false);
  expect(isLocale(null)).toBe(false);
});
