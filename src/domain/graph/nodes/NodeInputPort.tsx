import React, { ComponentProps } from 'react';
import { GraphNodeData } from '../editor/GraphFlowAdapter';
import { InputPort } from '../ports/InputPort';

export interface NodeInputPortProps extends Omit<ComponentProps<typeof InputPort>, 'connected' | 'value' | 'guidance' | 'onChange'> {
  nodeId: string;
  data: Pick<GraphNodeData, 'connectedInputPorts' | 'inputValues' | 'portGuidance' | 'onEdit'>;
}

/** Inherit the input editor while binding its live connection state and edits to a node. */
export function NodeInputPort({ nodeId, data, ...port }: NodeInputPortProps) {
  return <InputPort {...port}
    connected={data.connectedInputPorts?.has(port.id) ?? false}
    value={data.inputValues?.[port.id]}
    guidance={data.portGuidance?.inputs[port.id]}
    onChange={(text) => data.onEdit?.(nodeId, { kind: 'parameter', portId: port.id, text }) ?? false} />;
}
