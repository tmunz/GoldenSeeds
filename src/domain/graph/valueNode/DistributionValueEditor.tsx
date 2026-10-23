import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { DISTRIBUTION_FIELDS } from '../../../datatypes/ProbabilityDistribution';
import { DistributionState } from '../../config/stageItemState/DistributionState';
import { ExtendedRangeInput } from '../../../ui/input/ExtendedRangeInput';
import { PortValue } from '../PortValue';
import { portColor } from '../PortColors';

export function DistributionValueEditor({ state, inputValues, onCommit }: {
  state: DistributionState;
  inputValues?: Record<string, PortValue>;
  onCommit: () => void;
}) {
  return (
    <div className="distribution-editor">
      {DISTRIBUTION_FIELDS.map((field) => {
        const connected = inputValues?.[field];
        return (
          <div className="distribution-field" key={field}>
            <Handle type="target" position={Position.Left} id={field} style={{ background: portColor('number') }} />
            {connected?.type === 'number' ? (
              <div className="distribution-connected">{field}: {connected.value}</div>
            ) : (
              <ExtendedRangeInput
                label={field}
                value={String(state.getValue()[field])}
                min={0}
                max={field === 'seed' ? 999 : 1}
                step={field === 'seed' ? 1 : 0.05}
                onChange={(text) => {
                  state.setValue({ ...state.getValue(), [field]: Number(text) });
                  onCommit();
                }}
                className={state.isValid() ? '' : 'invalid range-invalid'}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
