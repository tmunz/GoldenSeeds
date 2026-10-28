import React, { useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { GeneratorNodeConfig } from './GeneratorNode';
import { parseParamPortId } from './ParamPorts';
import { parameterEditorText } from './ParameterValues';
import { InputPort } from './InputPort';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';

import './GraphNodeView.css';

export function GraphNodeView({ id, data }: NodeProps<FlowNode>) {
  const { graphNode } = data;
  const config = graphNode.config as GeneratorNodeConfig;
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, data.connectedInputPorts, updateNodeInternals]);
  return (
    <div className="graph-node">
      <div className="graph-node-header">{graphNode.kind}</div>
      <div className="graph-node-body">
        <div className="graph-node-ports graph-node-inputs">
          {graphNode.inputs.map((port) => {
            const param = parseParamPortId(port.id);
            const definition = param ? config.generator.definition[param.groupId]?.[param.id] : undefined;
            const state = param ? config.parameters[param.groupId]?.[param.id] : undefined;
            return <InputPort key={port.id} id={port.id} type={port.type} definition={definition}
              localText={definition && state ? parameterEditorText(definition, state) : ''}
              connected={data.connectedInputPorts?.has(port.id) ?? false} value={data.inputValues?.[port.id]}
              onChange={(text) => data.onEdit?.(id, { kind: 'parameter', portId: port.id, text }) ?? false} />;
          })}
        </div>
        <div className="graph-node-ports graph-node-outputs">
          {graphNode.outputs.map((port) => (
            <div className="graph-node-port" key={port.id}>
              <span className="graph-node-port-label">{port.id}</span>
              <Handle type="source" position={Position.Right} id={port.id} style={{ background: portColor(port.type) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
