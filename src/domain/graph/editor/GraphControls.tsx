import React from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { Controls, ControlButton, Node, useReactFlow, useStore, useStoreApi } from '@xyflow/react';
import { RENDER_NODE_ID } from '../nodes/render/RenderNode';

/** Zoom to the given nodes; the render connector is only a pinned overlay and never part of the fit. */
export function fitNodes(fitView: ReturnType<typeof useReactFlow>['fitView'], nodes: Node[]): void {
  const fitted = nodes.filter(node => node.id !== RENDER_NODE_ID);
  if (fitted.length) {
    void fitView({ nodes: fitted, duration: 300, padding: 0.2, minZoom: 0.1, maxZoom: 1 });
  }
}

/** Viewport actions live together in the bottom-left control bar. */
export function GraphControls({ snapToGrid, onToggleSnap }: { snapToGrid: boolean; onToggleSnap: () => void }) {
  const { t } = useTranslation();
  const { getNodes, fitView } = useReactFlow();
  const store = useStoreApi();
  const isInteractive = useStore(state => state.nodesDraggable || state.nodesConnectable || state.elementsSelectable);
  const hasSelection = useStore(state => state.nodes.some(node => node.selected && node.id !== RENDER_NODE_ID));

  function fitGraph(selectedOnly = false) {
    fitNodes(fitView, getNodes().filter(node => !selectedOnly || node.selected));
  }

  return <Controls position="bottom-left" showFitView={false} showInteractive={false} aria-label={t('graph.navigation')}>
    <ControlButton title={t('graph.fit')} aria-label={t('graph.fit')} onClick={() => fitGraph()}>
      <svg className="graph-fit-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
        <rect x="8" y="8" width="8" height="8" />
      </svg>
    </ControlButton>
    <ControlButton title={t('graph.fitSelection')} aria-label={t('graph.fitSelection')} disabled={!hasSelection} onClick={() => fitGraph(true)}>
      <svg className="graph-fit-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
        <rect x="7" y="7" width="10" height="10" />
      </svg>
    </ControlButton>
    <ControlButton title={t('graph.snap')} aria-label={t('graph.snap')} aria-pressed={snapToGrid} onClick={onToggleSnap}>
      <svg className="graph-fit-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 3v10a7 7 0 0 0 14 0V3h-5v10a2 2 0 0 1-4 0V3H5ZM5 7h5m4 0h5" />
      </svg>
    </ControlButton>
    <ControlButton title={t(isInteractive ? 'graph.lock' : 'graph.unlock')} aria-label={t('graph.interactivity')} aria-pressed={isInteractive}
      onClick={() => store.setState({ nodesDraggable: !isInteractive, nodesConnectable: !isInteractive, elementsSelectable: !isInteractive })}>
      <svg className="graph-fit-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="10" width="14" height="11" rx="1" />
        <path d={isInteractive ? 'M8 10V6a4 4 0 0 1 8 0' : 'M8 10V6a4 4 0 0 1 8 0v4'} />
        <path d="M12 14v3" />
      </svg>
    </ControlButton>
  </Controls>;
}
