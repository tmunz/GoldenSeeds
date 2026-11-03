import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { connectionMidpointAngle } from './ConnectionGeometry';
import { DeleteIcon } from '../../../ui/icon/Delete';

/** Selected connections expose a delete action at the curve's midpoint. */
export function ConnectionEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  selected, style, markerStart, markerEnd, interactionWidth }: EdgeProps) {
  const { t } = useTranslation();
  const { deleteElements } = useReactFlow();
  const [deleteHovered, setDeleteHovered] = useState(false);
  useEffect(() => { if (!selected) { setDeleteHovered(false); } }, [selected]);
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const angle = connectionMidpointAngle(path);

  return <>
    <BaseEdge id={id} path={path} className="graph-connection-path"
      style={selected && deleteHovered ? { ...style, stroke: 'var(--errorColor)' } : style}
      markerStart={markerStart} markerEnd={markerEnd} interactionWidth={interactionWidth} />
    <EdgeLabelRenderer>
      <div className={`graph-edge-control${selected ? ' is-selected' : ''}`}
        style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
        <span className="graph-edge-eye-orientation" style={{ transform: `rotate(${angle}deg)` }} aria-hidden="true">
          <svg className="graph-edge-eye" viewBox="0 0 64 36">
            <path d="M1 18 Q32 -14 63 18 Q32 50 1 18 Z" />
          </svg>
        </span>
        {selected && <button type="button" className="graph-edge-delete nodrag nopan" aria-label={t('graph.deleteConnection')} title={t('graph.deleteConnection')}
          onPointerEnter={() => setDeleteHovered(true)}
          onPointerLeave={() => setDeleteHovered(false)}
          onClick={event => {
            event.stopPropagation();
            void deleteElements({ edges: [{ id }] });
          }}>
          <DeleteIcon />
        </button>}
      </div>
    </EdgeLabelRenderer>
  </>;
}
