import React from 'react';
import { useTranslation } from '../../../../i18n/I18n';
import { NodeProps } from '@xyflow/react';
import type { Font } from 'opentype.js';
import { ProbabilityDistribution } from '../../../../datatypes/ProbabilityDistribution';
import { FlowNode } from '../../editor/GraphFlowAdapter';
import { GraphPortHandle } from '../../ports/GraphPortHandle';
import { DEFAULT_VALUE_DEFINITIONS, ValueNodeConfig, VALUE_KIND_PREFIX } from './ValueNodeRegistry';
import { ParamDefinitionType } from '../../../generator/SvgGenerator';
import { ParameterEditor } from '../../parameters/ParameterEditor';
import { DistributionValueEditor } from './DistributionValueEditor';
import { FontValueEditor } from './FontValueEditor';

import { NodeView } from '../NodeView';

/** Standalone value nodes share scalar editors with generator input ports. */
export function ValueNodeView({ id, data, selected, deletable }: NodeProps<FlowNode<ValueNodeConfig>>) {
  const { t } = useTranslation();
  const { graphNode } = data;
  const { state } = graphNode.config;
  const type = graphNode.kind.slice(VALUE_KIND_PREFIX.length) as ParamDefinitionType;
  const definition = data.definition ?? DEFAULT_VALUE_DEFINITIONS[type];
  const outputPort = graphNode.outputs[0];
  return (
    <NodeView id={id} connectedInputPorts={data.connectedInputPorts} title={t(`ports.${type}`, {}, type)}
      selected={selected} onDelete={deletable && data.onDelete ? () => data.onDelete?.(id) : undefined}
      width={type === 'color' || type === 'font' ? 176 : undefined} output={outputPort && (
        <GraphPortHandle direction="source" id={outputPort.id} portType={outputPort.type} guidance={data.portGuidance?.outputs[outputPort.id]} />
      )}>
      {type === 'distribution' ? <DistributionValueEditor nodeId={id} data={data} value={state.getValue() as ProbabilityDistribution} />
        : type === 'font' ? <FontValueEditor label={t('fields.value')} value={state.getValue() as Font}
          onChange={(value) => data.onEdit?.(id, { kind: 'font', value })} />
          : <ParameterEditor showAnimation={type === 'number'} label={t('fields.value')} value={state.getTextValue()} definition={definition}
            onChange={(text) => data.onEdit?.(id, { kind: 'value', text, definition }) ?? false} />}
    </NodeView>
  );
}
