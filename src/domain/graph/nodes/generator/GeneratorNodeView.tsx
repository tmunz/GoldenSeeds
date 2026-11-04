import React from 'react';
import { useTranslation } from '../../../../i18n/I18n';
import { NodeProps } from '@xyflow/react';
import { GeneratorNodeConfig } from './GeneratorNode';
import { parseParamPortId } from '../../parameters/ParamPorts';
import { parameterEditorText } from '../../parameters/ParameterValues';
import { NodeInputPort } from '../NodeInputPort';
import { FlowNode } from '../../editor/GraphFlowAdapter';
import { GraphPortHandle } from '../../ports/GraphPortHandle';
import { PortDefinition } from '../../model/PortValue';
import { NodeView } from '../NodeView';

export function GeneratorNodeView({ id, data, selected, deletable }: NodeProps<FlowNode<GeneratorNodeConfig>>) {
  const { t } = useTranslation();
  const { graphNode } = data;
  const config = graphNode.config;
  return (
    <NodeView id={id} kind={graphNode.kind} title={t(`generators.${graphNode.kind}`, {}, graphNode.kind)} layout="ports" collapsible collapsed={data.collapsed}
      selected={selected} onDelete={deletable && data.onDelete ? () => data.onDelete?.(id) : undefined}
      onCollapseChange={(collapsed) => data.onCollapseChange?.(id, collapsed)} connectedInputPorts={data.connectedInputPorts}
      portGuidance={data.portGuidance}>
      {(collapsed) => {
        const groups = new Map<string, PortDefinition[]>();
        graphNode.inputs.forEach((port) => {
          const param = parseParamPortId(port.id);
          const guidance = data.portGuidance?.inputs[port.id];
          const revealForConnection = guidance === 'compatible' || guidance === 'origin';
          if (collapsed && param && !data.connectedInputPorts?.has(port.id) && !revealForConnection) { return; }
          const groupId = param?.groupId ?? 'inputs';
          const ports = groups.get(groupId) ?? [];
          ports.push(port);
          groups.set(groupId, ports);
        });
        return <>
          <div className="node-inputs">
            {Array.from(groups, ([groupId, ports]) => (
              <section className="node-input-group" key={groupId} aria-label={t(`groups.${groupId}`, {}, groupId)}>
                {groupId !== 'inputs' && <h3>{t(`groups.${groupId}`, {}, groupId)}</h3>}
                {ports.map((port) => {
                  const param = parseParamPortId(port.id);
                  const definition = param ? config.generator.definition[param.groupId]?.[param.id] : undefined;
                  const state = param ? config.parameters[param.groupId]?.[param.id] : undefined;
                  return <NodeInputPort key={port.id} nodeId={id} data={data} id={port.id} label={param ? t(`parameters.${param.id}`, {}, param.id) : t(`ports.${port.id}`, {}, port.id)}
                    type={port.type} definition={definition}
                    localText={definition && state ? parameterEditorText(definition, state) : ''} />;
                })}
              </section>
            ))}
          </div>
          <div className="node-outputs" aria-label={t('graph.outputs')}>
            {graphNode.outputs.map((port) => (
              <div className="node-port" key={port.id}>
                <span className="node-port-label">{t(`ports.${port.id}`, {}, port.id)}</span>
                <GraphPortHandle direction="source" id={port.id} portType={port.type} guidance={data.portGuidance?.outputs[port.id]} />
              </div>
            ))}
          </div>
        </>;
      }}
    </NodeView>
  );
}
