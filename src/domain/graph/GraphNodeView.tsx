import React, { useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { TextInput } from '../../ui/input/TextInput';
import { Stage } from '../config/Stage';
import { ParamDefinitionMinMaxStep } from '../generator/SvgGenerator';
import { parseParamPortId, selectionOptions } from './ParamPorts';
import { ExpressionParameterEditor } from './ExpressionParameterEditor';
import { NumberParameterEditor } from './NumberParameterEditor';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';
import { formatPortValue } from './PortValueFormat';

import './GraphNodeView.styl';

export function GraphNodeView({ id, data }: NodeProps<FlowNode>) {
  const { graphNode } = data;
  const stage = graphNode.config as Stage;
  const updateNodeInternals = useUpdateNodeInternals();
  // Inline editors can change handle positions even when the overall node size stays the same.
  useEffect(() => { updateNodeInternals(id); }, [id, data.connectedInputPorts, updateNodeInternals]);

  return (
    <div className="graph-node">
      <div className="graph-node-header">{graphNode.kind}</div>
      <div className="graph-node-body">
        <div className="graph-node-ports graph-node-inputs">
          {graphNode.inputs.map((port) => {
            const isConnected = data.connectedInputPorts?.has(port.id) ?? false;
            const param = parseParamPortId(port.id);
            const definition = param ? stage.generator.definition[param.groupId]?.[param.id] : undefined;
            const options = selectionOptions(definition);
            const inputValue = data.inputValues?.[port.id];
            const selectedIndex = inputValue?.type === 'number' ? inputValue.value : -1;
            const editable = (definition?.type === 'number' || definition?.type === 'selection' || definition?.type === 'expression' || definition?.type === 'string') && !isConnected;
            return (
              <div className={`graph-node-port${editable ? ' graph-node-port-editable' : ''}`} key={port.id}>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  style={{ background: portColor(port.type) }}
                />
                {editable && param && definition?.type === 'selection' ? (
                  <label className="graph-node-option-editor nodrag nowheel">
                    <span>{port.id}</span>
                    <select
                      value={options.indexOf(stage.state.data[param.groupId][param.id].getTextValue())}
                      onChange={(event) => data.onParameterChange?.(id, port.id, event.target.value)}
                    >
                      {options.map((option, index) => <option key={option} value={index}>{index}: {option}</option>)}
                    </select>
                  </label>
                ) : editable && param && definition?.type === 'string' ? (
                  <div className="string-parameter-editor nodrag nowheel">
                    <TextInput
                      label={port.id}
                      value={stage.state.data[param.groupId][param.id].getTextValue()}
                      onChange={(text) => data.onParameterChange?.(id, port.id, text)}
                    />
                  </div>
                ) : editable && param && definition?.type === 'expression' ? (
                  <ExpressionParameterEditor
                    label={port.id}
                    value={stage.state.data[param.groupId][param.id].getTextValue()}
                    definition={definition as Partial<ParamDefinitionMinMaxStep>}
                    onChange={(text) => data.onParameterChange?.(id, port.id, text) ?? false}
                  />
                ) : editable && param ? (
                  <NumberParameterEditor
                    label={port.id}
                    value={stage.state.data[param.groupId][param.id].getTextValue()}
                    definition={definition as Partial<ParamDefinitionMinMaxStep>}
                    onChange={(text) => data.onParameterChange?.(id, port.id, text)}
                  />
                ) : (
                  <>
                    <span className="graph-node-port-label">{port.id}</span>
                    <span className={`graph-node-port-value${isConnected ? '' : ' graph-node-port-value-default'}`}>
                      {formatPortValue(data.inputValues?.[port.id])}
                      {definition?.type === 'selection' && `: ${options[selectedIndex] ?? 'invalid index'}`}
                    </span>
                  </>
                )}
              </div>
            );
          })}
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

