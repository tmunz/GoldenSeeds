import React, { useEffect, useId, useState } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { GeneratorNodeConfig } from './GeneratorNode';
import { parseParamPortId } from './ParamPorts';
import { parameterEditorText } from './ParameterValues';
import { InputPort } from './InputPort';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';
import { PortDefinition } from './PortValue';
import { AnimatedIcon } from '../../ui/AnimatedIcon';
import { ArrowNone, ArrowRegular } from '../../ui/icon/Arrow';

import './Node.css';
import './GraphNodeView.css';

function readableLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

export function GraphNodeView({ id, data }: NodeProps<FlowNode>) {
  const { graphNode } = data;
  const config = graphNode.config as GeneratorNodeConfig;
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, collapsed, data.connectedInputPorts, updateNodeInternals]);

  const groups = new Map<string, PortDefinition[]>();
  graphNode.inputs.forEach((port) => {
    if (collapsed && !data.connectedInputPorts?.has(port.id)) { return; }
    const groupId = parseParamPortId(port.id)?.groupId ?? 'inputs';
    const ports = groups.get(groupId) ?? [];
    ports.push(port);
    groups.set(groupId, ports);
  });

  return (
    <div className={`graph-node${collapsed ? ' graph-node-collapsed' : ''}`}>
      <div className="graph-node-header node-header">
        <span className="node-title">{graphNode.kind}</span>
        <button
          type="button"
          className="node-collapse nodrag nopan"
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${graphNode.kind} node`}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          onClick={() => setCollapsed(value => !value)}
        >
          <AnimatedIcon points={[ArrowNone, ArrowRegular]} index={1} rotation={collapsed ? 270 : 0} />
        </button>
      </div>
      <div className="graph-node-body" id={bodyId}>
        <div className="graph-node-inputs">
          {Array.from(groups, ([groupId, ports]) => (
            <section className="graph-node-input-group" key={groupId} aria-label={readableLabel(groupId)}>
              <h3>{readableLabel(groupId)}</h3>
              {ports.map((port) => {
                const param = parseParamPortId(port.id);
                const definition = param ? config.generator.definition[param.groupId]?.[param.id] : undefined;
                const state = param ? config.parameters[param.groupId]?.[param.id] : undefined;
                return <InputPort key={port.id} id={port.id} label={readableLabel(param?.id ?? port.id)}
                  type={port.type} definition={definition}
                  localText={definition && state ? parameterEditorText(definition, state) : ''}
                  connected={data.connectedInputPorts?.has(port.id) ?? false} value={data.inputValues?.[port.id]}
                  onChange={(text) => data.onEdit?.(id, { kind: 'parameter', portId: port.id, text }) ?? false} />;
              })}
            </section>
          ))}
        </div>
        <div className="graph-node-outputs" aria-label="Outputs">
          <h3>outputs</h3>
          {graphNode.outputs.map((port) => (
            <div className="graph-node-port" key={port.id}>
              <span className="graph-node-port-label">{readableLabel(port.id)}</span>
              <Handle type="source" position={Position.Right} id={port.id} style={{ background: portColor(port.type) }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
