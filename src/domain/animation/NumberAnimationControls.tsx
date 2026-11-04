import React, { useContext, useState } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { PlayNone, PlayRegular, PlayStop } from '../../ui/icon/Play';
import { ExtendedRangeInput } from '../../ui/input/ExtendedRangeInput';
import { useNodeId } from '@xyflow/react';
import { DEFAULT_ANIMATION_SECONDS } from './AnimationService';
import { GraphAnimationContext } from './useGraphAnimation';
import { NumberDefinition } from './GraphAnimation';

import './NumberAnimationControls.css';

export function NumberAnimationControls({ value, definition, portId, valid }: {
  value: string;
  definition: NumberDefinition;
  portId?: string;
  valid: boolean;
}) {
  const { t } = useTranslation();
  const nodeId = useNodeId();
  const animation = useContext(GraphAnimationContext);
  const [seconds, setSeconds] = useState(String(DEFAULT_ANIMATION_SECONDS));
  if (!nodeId || !animation) { return null; }
  const frame = animation.frames.find((frame) => frame.input.nodeId === nodeId && frame.input.portId === portId);
  const target = Number(value);
  const duration = Number(seconds);
  const validDuration = seconds.trim() !== '' && Number.isFinite(duration) && duration > 0;
  const canPlay = valid && value.trim() !== '' && Number.isFinite(target) && validDuration;
  return (
    <div className="number-animation-controls">
      <ExtendedRangeInput label={t('animation.seconds')} description={t('animation.duration')}
        value={seconds} onChange={setSeconds} min={0.1} max={10} step={0.1}
        className={validDuration ? '' : 'invalid range-invalid'} />
      <AnimatedButton
        disabled={!frame && !canPlay}
        title={t(frame ? 'animation.stop' : 'animation.animate')}
        iconText={`${Number(frame ? frame.value.toFixed(3) : target.toFixed(3))}`}
        active={Boolean(frame)}
        points={[PlayNone, PlayRegular, PlayStop]}
        onClick={() => frame ? animation.stop(nodeId, portId) : animation.play({ nodeId, portId, target, definition }, duration)} />
    </div>
  );
}
