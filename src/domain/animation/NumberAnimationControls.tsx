import React, { useContext, useState } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { AnimatedButton } from '../../ui/AnimatedButton';
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
  const canPlay = valid && value.trim() !== '' && Number.isFinite(target) && Number.isFinite(duration) && duration > 0;
  return (
    <div className="number-animation-controls">
      <label>
        <input aria-label={t('animation.duration')} type="number" min="0.1" step="0.1" value={seconds}
          onChange={(event) => setSeconds(event.target.value)} />
        <span>{t('animation.seconds')}</span>
      </label>
      <AnimatedButton disabled={!frame && !canPlay} title={t(frame ? 'animation.stop' : 'animation.animate')} iconText={t('animation.value')}
        active={Boolean(frame)}
        points={[[[30, 20], [80, 50], [30, 80], [30, 20], [30, 20]], [[30, 20], [80, 50], [30, 80], [30, 20], [30, 20]], [[25, 25], [75, 25], [75, 75], [25, 75], [25, 25]]]}
        onClick={() => frame ? animation.stop(nodeId, portId) : animation.play({ nodeId, portId, target, definition }, duration)} />
      {frame && <output aria-label={t('animation.animatedValue')}>{Number(frame.value.toFixed(3))}</output>}
    </div>
  );
}
