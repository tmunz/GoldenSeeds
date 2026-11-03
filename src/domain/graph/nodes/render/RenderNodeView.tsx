import React, { CSSProperties, useEffect } from 'react';
import { useTranslation } from '../../../../i18n/I18n';
import { NodeProps, useViewport, useUpdateNodeInternals } from '@xyflow/react';
import { FlowNode } from '../../editor/GraphFlowAdapter';
import { GraphPortHandle } from '../../ports/GraphPortHandle';
import { RESULT_PORTS } from '../../runtime/GraphResult';

import './RenderNodeView.css';

/** Fixed-size terminal connectors; GraphCanvas anchors this node to the viewport edge. */
export function RenderNodeView({ id, data }: NodeProps<FlowNode>) {
  const { t } = useTranslation();
  const { zoom } = useViewport();
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, zoom, updateNodeInternals]);

  return (
    <div className="render-node nodrag" style={{ '--portScale': 1 / zoom } as CSSProperties} aria-label={t('graph.render')}>
      {RESULT_PORTS.map((port) => (
        <div className="render-node-port" key={port.id}>
          <GraphPortHandle direction="target" id={port.id} portType={port.type} guidance={data.portGuidance?.inputs[port.id]} />
        </div>
      ))}
    </div>
  );
}
