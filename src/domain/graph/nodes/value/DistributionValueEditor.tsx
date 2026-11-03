import React from 'react';
import { useTranslation } from '../../../../i18n/I18n';
import { DISTRIBUTION_DEFINITION, DISTRIBUTION_FIELDS, ProbabilityDistribution } from '../../../../datatypes/ProbabilityDistribution';
import { NodeInputPort, NodeInputPortProps } from '../NodeInputPort';

import './DistributionValueEditor.css';

interface DistributionValueEditorProps extends Pick<NodeInputPortProps, 'nodeId' | 'data'> {
  value: ProbabilityDistribution;
}

export function DistributionValueEditor({ value, nodeId, data }: DistributionValueEditorProps) {
  const { t } = useTranslation();
  return <div className="distribution-editor">
    {DISTRIBUTION_FIELDS.map((field) => <NodeInputPort key={field} id={field} label={t(`parameters.${field}`, {}, field)} nodeId={nodeId} data={data} type="number"
      definition={DISTRIBUTION_DEFINITION[field]} localText={String(value[field])} />)}
  </div>;
}
