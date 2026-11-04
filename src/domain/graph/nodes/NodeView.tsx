import React, { ReactNode, useEffect, useId, useLayoutEffect, useRef } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { useUpdateNodeInternals } from '@xyflow/react';
import { GraphNodeData } from '../editor/GraphFlowAdapter';
import { AnimatedButton } from '../../../ui/AnimatedButton';
import { ArrowLine, ArrowNone, ArrowRegular } from '../../../ui/icon/Arrow';
import { DeleteIcon } from '../../../ui/icon/Delete';
import { NodeTypeIcon } from '../../../ui/icon/NodeType';

import './NodeView.css';

const useNodeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface NodeViewProps extends Pick<GraphNodeData, 'connectedInputPorts' | 'portGuidance'> {
  id: string;
  title: string;
  kind?: string;
  children: ReactNode | ((collapsed: boolean) => ReactNode);
  layout?: 'content' | 'ports';
  width?: number;
  selected?: boolean;
  onDelete?: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  output?: ReactNode;
}

/** Shared card, drag header, collapse behavior and handle measurement for editable nodes. */
export function NodeView({ id, title, kind, children, layout = 'content', width, selected = false, onDelete, collapsible = false, collapsed = false, onCollapseChange, connectedInputPorts, portGuidance, output }: NodeViewProps) {
  const { t } = useTranslation();
  const updateNodeInternals = useUpdateNodeInternals();
  const bodyRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<number>();
  const animationRef = useRef<Animation>();
  const previousCollapsed = useRef(collapsed);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) { return; }
    const observer = new ResizeObserver(() => {
      if (!animationRef.current) { heightRef.current = body.offsetHeight; }
      updateNodeInternals(id);
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, [id, updateNodeInternals]);

  useNodeLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) { return; }
    const changed = previousCollapsed.current !== collapsed;
    previousCollapsed.current = collapsed;
    // Read the current animated height before cancelling, so rapid toggles reverse smoothly.
    const from = animationRef.current ? body.offsetHeight : heightRef.current;
    animationRef.current?.cancel();
    animationRef.current = undefined;
    const to = body.offsetHeight;
    heightRef.current = to;
    if (!changed || from === undefined || from === to || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateNodeInternals(id);
      return;
    }
    const style = getComputedStyle(body);
    const duration = style.getPropertyValue('--motionDuration').trim();
    const animation = body.animate([
      { height: `${from}px`, clipPath: 'inset(0 -16px)' },
      { height: `${to}px`, clipPath: 'inset(0 -16px)' },
    ], {
      duration: parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000),
      easing: style.getPropertyValue('--motionEase').trim(),
    });
    animationRef.current = animation;
    let frame = 0;
    const measure = () => {
      updateNodeInternals(id);
      if (animation.playState === 'running') { frame = requestAnimationFrame(measure); }
    };
    measure();
    void animation.finished.then(() => {
      if (animationRef.current === animation) {
        animationRef.current = undefined;
        heightRef.current = body.offsetHeight;
        updateNodeInternals(id);
      }
    }, () => { /* Cancellation is expected when toggling during a transition. */ });
    return () => { cancelAnimationFrame(frame); };
  }, [collapsed, id, updateNodeInternals]);

  useEffect(() => () => animationRef.current?.cancel(), []);
  useEffect(() => { updateNodeInternals(id); }, [id, collapsed, connectedInputPorts, portGuidance, updateNodeInternals]);
  const bodyId = useId();
  return (
    <div className={`node node-${layout}${collapsed ? ' node-collapsed' : ''}`} style={width === undefined ? undefined : { width, minWidth: width }}>
      <div className="node-header">
        <div className="node-heading">
          {kind && <NodeTypeIcon kind={kind} />}
          <span className="node-title" title={title}>{title}</span>
        </div>
        <div className="node-header-actions">
          {selected && onDelete && <button type="button" className="node-delete nodrag nopan"
            aria-label={t('graph.deleteNode', { name: title })} title={t('graph.deleteNode', { name: title })} onClick={event => {
              event.stopPropagation();
              onDelete();
            }}>
            <DeleteIcon />
          </button>}
          {collapsible && <AnimatedButton
            className="node-collapse nodrag nopan"
            title={t(collapsed ? 'graph.expandNode' : 'graph.collapseNode', { name: title })}
            points={[ArrowNone, ArrowRegular, ArrowLine]}
            active={!collapsed}
            expanded={!collapsed}
            controls={bodyId}
            onClick={() => onCollapseChange?.(!collapsed)}
          />}
        </div>
      </div>
      <div className="node-body" id={bodyId} ref={bodyRef}>{typeof children === 'function' ? children(collapsed) : children}</div>
      {output && <div className="node-output-handle">{output}</div>}
    </div>
  );
}
