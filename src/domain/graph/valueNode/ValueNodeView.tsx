import React, { useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import type { Font } from 'opentype.js';
import { ProbabilityDistribution } from '../../../datatypes/ProbabilityDistribution';
import { FlowNode } from '../GraphFlowAdapter';
import { portColor } from '../PortColors';
import { DEFAULT_VALUE_DEFINITIONS, ValueNodeConfig, VALUE_KIND_PREFIX } from '../ValueNodeRegistry';
import { ParamDefinitionType } from '../../generator/SvgGenerator';
import { ParameterEditor } from '../ParameterEditor';
import { DistributionValueEditor } from './DistributionValueEditor';
import { FontValueEditor } from './FontValueEditor';

import '../Node.css';
import './ValueNodeView.css';

/** Standalone value nodes share scalar editors with generator input ports. */
export function ValueNodeView({ id, data }: NodeProps<FlowNode>) {
  const { graphNode } = data;
  const { state } = graphNode.config as ValueNodeConfig;
  const type = graphNode.kind.slice(VALUE_KIND_PREFIX.length) as ParamDefinitionType;
  const definition = data.definition ?? DEFAULT_VALUE_DEFINITIONS[type];
  const outputPort = graphNode.outputs[0];
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, data.connectedInputPorts, updateNodeInternals]);
  return (
    <div className="value-node">
      <div className="value-node-header node-header"><span className="node-title">{type}</span></div>
      <div className="value-node-body">
        {type === 'distribution' ? <DistributionValueEditor value={state.getValue() as ProbabilityDistribution}
          inputValues={data.inputValues} connectedInputPorts={data.connectedInputPorts}
          onChange={(portId, text) => data.onEdit?.(id, { kind: 'parameter', portId, text }) ?? false} />
          : type === 'font' ? <FontValueEditor value={state.getValue() as Font}
            onChange={(value) => data.onEdit?.(id, { kind: 'font', value })} />
            : <ParameterEditor showAnimation={type === 'number'} label={type} value={state.getTextValue()} definition={definition}
              onChange={(text) => data.onEdit?.(id, { kind: 'value', text, definition }) ?? false} />}
      </div>
      {outputPort && <div className="value-node-port">
        <Handle type="source" position={Position.Right} id={outputPort.id} style={{ background: portColor(outputPort.type) }} />
      </div>}
    </div>
  );
}
