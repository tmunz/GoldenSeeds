import React, { useEffect } from 'react';
import { Handle, Position, NodeProps, useViewport, useUpdateNodeInternals } from '@xyflow/react';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';
import { RENDER_IN_GRID_PORT, RENDER_IN_SVG_PORT, RENDER_IN_BOUNDING_BOX_PORT } from './RenderNode';

import './RenderNodeView.styl';

const INPUT_PORTS = [
  { id: RENDER_IN_GRID_PORT, type: 'grid' as const },
  { id: RENDER_IN_SVG_PORT, type: 'svg' as const },
  { id: RENDER_IN_BOUNDING_BOX_PORT, type: 'boundingBox' as const },
];

/** Fixed-size terminal connectors; GraphCanvas anchors this node to the viewport edge. */
export function RenderNodeView({ id }: NodeProps<FlowNode>) {
  const { zoom } = useViewport();
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, zoom, updateNodeInternals]);

  return (
    <div className="render-node nodrag" style={{ transform: `scale(${1 / zoom})` }} aria-label="Output to drawing preview">
      {INPUT_PORTS.map((port) => (
        <div className="render-node-port" key={port.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={port.id}
            style={{ background: portColor(port.type) }}
          />
          {/* <span>{port.id}</span> */}
        </div>
      ))}
    </div>
  );
}
