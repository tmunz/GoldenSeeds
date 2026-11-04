import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { Panel, useReactFlow, useStore } from '@xyflow/react';

import { GraphNode } from '../model/GraphNode';
import { GraphPosition, graphNodeWidth } from '../model/GraphLayout';
import { ParamDefinitionType } from '../../generator/SvgGenerator';
import { generatorNodeRegistry } from '../nodes/generator/GeneratorNodeRegistry';
import { RENDER_NODE_ID } from '../nodes/render/RenderNode';
import { findFreeNodePosition } from './GraphPlacement';
import { newNodeId } from './NodeInsertion';
import { GeneratorNodeConfig } from '../nodes/generator/GeneratorNode';
import { valueNodeRegistry, DEFAULT_VALUE_DEFINITIONS } from '../nodes/value/ValueNodeRegistry';
import { NodeTypeIcon } from '../../../ui/icon/NodeType';

import './NodePalette.css';

const VALUE_KINDS: ParamDefinitionType[] = ['number', 'expression', 'points', 'distribution', 'color', 'string', 'font'];

export interface NodePaletteProps {
  onAdd: (node: GraphNode, position: GraphPosition) => void;
}

/**
 * A hover/touch palette for adding nodes beside a large plus control:
 * any registered generator kind (shape, cartesian, polar, ...) or any literal value node
 * (number, expression, color, string, font). New nodes are placed near the current graph viewport, avoiding existing nodes.
 */
export function NodePalette({ onAdd }: NodePaletteProps) {
  const { t } = useTranslation();
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;
  const { getViewport, getNodes } = useReactFlow();
  const width = useStore(state => state.width);
  const height = useStore(state => state.height);
  const panelRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const busyRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function close() {
    pinnedRef.current = false;
    setOpen(false);
  }

  useEffect(() => {
    if (!open) { return; }
    const dismiss = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) { close(); }
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function placement(node: GraphNode): GraphPosition {
    const { x, y, zoom } = getViewport();
    const generator = (node.config as Partial<GeneratorNodeConfig> | undefined)?.generator;
    const parameterCount = generator ? Object.values(generator.definition).reduce((count, group) => count + Object.keys(group).length, 0) : 0;
    const size = { width: graphNodeWidth(node.kind), height: generator ? 400 + parameterCount * 80 : 480 };
    const preferred = {
      x: (width / 2 - x) / zoom - size.width / 2,
      y: (Math.max(120, height / 3) - y) / zoom,
    };
    const occupied = getNodes().filter(node => node.id !== RENDER_NODE_ID).map(node => ({
      ...node.position,
      width: node.measured?.width ?? node.width ?? 380,
      height: node.measured?.height ?? node.height ?? 600,
    }));
    return findFreeNodePosition(preferred, size, occupied);
  }

  async function add(kind: string, type: 'generator' | 'value') {
    if (busyRef.current) { return; }
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const node = type === 'generator'
        ? await generatorNodeRegistry.createNode(kind, newNodeId(kind))
        : await valueNodeRegistry.createNode(kind as ParamDefinitionType, newNodeId(`value-${kind}`), DEFAULT_VALUE_DEFINITIONS[kind as ParamDefinitionType].initial);
      onAddRef.current(node, placement(node));
      close();
    } catch {
      setError('graph.addError');
      setOpen(true);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Panel position="top-left" className="node-palette">
      <div
        ref={panelRef}
        role="presentation"
        className="node-palette-control nodrag nopan nowheel"
        onPointerEnter={(event) => { if (event.pointerType !== 'touch') { setOpen(true); } }}
        onPointerLeave={(event) => { if (event.pointerType !== 'touch' && !pinnedRef.current) { setOpen(false); } }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { close(); } }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            close();
            panelRef.current?.querySelector<HTMLButtonElement>('.node-palette-toggle')?.focus();
            event.stopPropagation();
          }
        }}
      >
        <button
          type="button"
          className="node-palette-toggle"
          aria-label={t('graph.add')}
          aria-expanded={open}
          aria-controls="node-palette-options"
          onClick={() => {
            pinnedRef.current = !pinnedRef.current;
            setOpen(pinnedRef.current);
          }}
        >
          <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
            <path d="M24 8V40M8 24H40" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <div id="node-palette-options" className="node-palette-menu" hidden={!open} role="region" aria-label={t('graph.types')} aria-busy={busy}>
          <div className="node-palette-groups">
            <section className="node-palette-group" aria-label={t('graph.values')}>
              <h3>{t('graph.value')}</h3>
              {VALUE_KINDS.map(kind => (
                <button key={kind} type="button" disabled={busy} onClick={() => add(kind, 'value')}>
                  <NodeTypeIcon kind={`value:${kind}`} />
                  <span>{t(`ports.${kind}`, {}, kind)}</span>
                </button>
              ))}
            </section>
            <section className="node-palette-group" aria-label={t('graph.generators')}>
              <h3>{t('graph.generator')}</h3>
              {generatorNodeRegistry.kinds.map(kind => (
                <button key={kind} type="button" disabled={busy} onClick={() => add(kind, 'generator')}>
                  <NodeTypeIcon kind={kind} />
                  <span>{t(`generators.${kind}`, {}, kind)}</span>
                </button>
              ))}
            </section>
          </div>
          {error && <p role="alert">{t(error)}</p>}
        </div>
      </div>
    </Panel>
  );
}
