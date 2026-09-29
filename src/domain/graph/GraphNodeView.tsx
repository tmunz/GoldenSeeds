import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';

import './GraphNodeView.styl';

export function GraphNodeView({ data }: NodeProps<FlowNode>) {
  const { graphNode } = data;

  return (
    <div className="graph-node">
      <div className="graph-node-header">{graphNode.kind}</div>
      <div className="graph-node-body">
        <div className="graph-node-ports graph-node-inputs">
          {graphNode.inputs.map((port) => (
            <div className="graph-node-port" key={port.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                style={{ background: portColor(port.type) }}
              />
              <span className="graph-node-port-label">{port.id}</span>
            </div>
          ))}
        </div>
        <div className="graph-node-ports graph-node-outputs">
          {graphNode.outputs.map((port) => (
            <div className="graph-node-port" key={port.id}>
              <span className="graph-node-port-label">{port.id}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={port.id}
                style={{ background: portColor(port.type) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const graphNodeTypes = { graphNode: GraphNodeView };
