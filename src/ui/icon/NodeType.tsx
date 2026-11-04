import React from 'react';
import generatorShape from './node-types/generator/shape.svg';
import generatorCartesian from './node-types/generator/cartesian.svg';
import generatorPolar from './node-types/generator/polar.svg';
import generatorFunction from './node-types/generator/function.svg';
import generatorText from './node-types/generator/text.svg';
import generatorTree from './node-types/generator/tree.svg';
import generatorVoronoi from './node-types/generator/voronoi.svg';
import valueNumber from './node-types/value/number.svg';
import valueExpression from './node-types/value/expression.svg';
import valuePoints from './node-types/value/points.svg';
import valueDistribution from './node-types/value/distribution.svg';
import valueColor from './node-types/value/color.svg';
import valueString from './node-types/value/string.svg';
import valueFont from './node-types/value/font.svg';
import valueSelection from './node-types/value/selection.svg';
import generic from './node-types/generic.svg';

const icons: Record<string, string> = {
  'shape': generatorShape,
  'cartesian': generatorCartesian,
  'polar': generatorPolar,
  'function': generatorFunction,
  'text': generatorText,
  'tree': generatorTree,
  'voronoi': generatorVoronoi,
  'value:number': valueNumber,
  'value:expression': valueExpression,
  'value:points': valuePoints,
  'value:distribution': valueDistribution,
  'value:color': valueColor,
  'value:string': valueString,
  'value:font': valueFont,
  'value:selection': valueSelection,
};

export function NodeTypeIcon({ kind }: { kind: string }) {
  const mask = `url("${icons[kind] ?? generic}") center / contain no-repeat`;
  return <span className="node-type-icon" aria-hidden="true" style={{
    display: 'inline-block', width: 18, height: 18, flexShrink: 0,
    backgroundColor: 'currentColor', mask, WebkitMask: mask,
  }} />;
}
