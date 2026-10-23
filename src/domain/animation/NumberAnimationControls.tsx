import React, { useContext, useState } from 'react';
import { useNodeId } from '@xyflow/react';
import { DEFAULT_ANIMATION_SECONDS } from './AnimationService';
import { GraphAnimationContext } from './useGraphAnimation';
import { NumberDefinition } from './GraphAnimation';

import './NumberAnimationControls.styl';

export function NumberAnimationControls({ value, definition, portId, valid }: {
  value: string;
  definition: NumberDefinition;
  portId?: string;
  valid: boolean;
}) {
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
        <input aria-label="Animation duration in seconds" type="number" min="0.1" step="0.1" value={seconds}
          onChange={(event) => setSeconds(event.target.value)} />
        <span>seconds</span>
      </label>
      <button type="button" disabled={!frame && !canPlay} aria-label={frame ? 'Stop animation' : 'Play animation'}
        title={frame ? 'Stop animation' : 'Animate from zero'}
        onClick={() => frame ? animation.stop(nodeId, portId) : animation.play({ nodeId, portId, target, definition }, duration)}>
        {frame ? '■' : '▶'}
      </button>
      {frame && <output aria-label="Animated value">{Number(frame.value.toFixed(3))}</output>}
    </div>
  );
}
