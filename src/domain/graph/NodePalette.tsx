import React, { useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';

import { GraphNode } from './GraphNode';
import { GraphPosition } from './GraphLayout';
import { ParamDefinitionType } from '../generator/SvgGenerator';
import { generatorNodeRegistry } from './GeneratorNodeRegistry';
import { valueNodeRegistry } from './ValueNodeRegistry';

import './NodePalette.styl';

const VALUE_KINDS: ParamDefinitionType[] = ['number', 'expression', 'color', 'string', 'font'];

const VALUE_DEFAULT_TEXT: Record<ParamDefinitionType, string> = {
  number: '0',
  expression: '() => 1',
  color: 'gold',
  selection: '',
  string: '',
  font: '',
};

export interface NodePaletteProps {
  onAdd: (node: GraphNode, position: GraphPosition) => void;
}

/** Generates a short, human-readable-enough unique node id, e.g. "shape- ab12c". */
function nodeId(kind: string): string {
  return `${kind}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * A small panel (see React Flow's Panel) letting the user add new nodes to the graph:
 * any registered generator kind (shape, cartesian, polar, ...) or any literal value node
 * (number, expression, color, string, font). New nodes are placed at the current center
 * of the viewport so they are always visible right after being added.
 */
export function NodePalette({ onAdd }: NodePaletteProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [generatorKind, setGeneratorKind] = useState(generatorNodeRegistry.kinds[0]);
  const [valueKind, setValueKind] = useState<ParamDefinitionType>(VALUE_KINDS[0]);
  const [busy, setBusy] = useState(false);

  function centerPosition(): GraphPosition {
    const { innerWidth, innerHeight } = window;
    return screenToFlowPosition({ x: innerWidth / 2, y: innerHeight / 2 });
  }

  async function addGenerator() {
    setBusy(true);
    try {
      const node = await generatorNodeRegistry.createNode(generatorKind, nodeId(generatorKind));
      onAdd(node, centerPosition());
    } finally {
      setBusy(false);
    }
  }

  async function addValue() {
    setBusy(true);
    try {
      const node = await valueNodeRegistry.createNode(valueKind, nodeId(`value-${valueKind}`), VALUE_DEFAULT_TEXT[valueKind]);
      onAdd(node, centerPosition());
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel position="top-left" className="node-palette">
      <div className="node-palette-group">
        <select value={generatorKind} onChange={(e) => setGeneratorKind(e.target.value)} disabled={busy}>
          {generatorNodeRegistry.kinds.map((kind) => (
            <option key={kind} value={kind}>{kind}</option>
          ))}
        </select>
        <button type="button" onClick={() => addGenerator()} disabled={busy}>+ generator</button>
      </div>
      <div className="node-palette-group">
        <select value={valueKind} onChange={(e) => setValueKind(e.target.value as ParamDefinitionType)} disabled={busy}>
          {VALUE_KINDS.map((kind) => (
            <option key={kind} value={kind}>{kind}</option>
          ))}
        </select>
        <button type="button" onClick={() => addValue()} disabled={busy}>+ value</button>
      </div>
    </Panel>
  );
}
