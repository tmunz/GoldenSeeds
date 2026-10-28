import React, { useEffect } from 'react';
import { Handle, Position, NodeProps, useViewport, useUpdateNodeInternals } from '@xyflow/react';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';
import { RESULT_PORTS } from './GraphResult';

import './RenderNodeView.css';

/** Fixed-size terminal connectors; GraphCanvas anchors this node to the viewport edge. */
export function RenderNodeView({ id }: NodeProps<FlowNode>) {
  const { zoom } = useViewport();
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, zoom, updateNodeInternals]);

  return (
    <div className="render-node nodrag" style={{ transform: `scale(${1 / zoom})` }} aria-label="Output to drawing preview">
      {RESULT_PORTS.map((port) => (
        <div className="render-node-port" key={port.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={port.id}
            style={{ background: portColor(port.type) }}
          />
        </div>
      ))}
    </div>
  );
}
