import React, { useState, useEffect } from 'react';

import { preconfigService } from '../preconfig/PreconfigService';
import { RawConfig } from '../config/RawConfig';
import { AnimatedButton } from '../../ui/AnimatedButton';

import './PreconfigSelector.styl';


interface Props {
  preconfigs?: { name: string; rawConfig: RawConfig; svg: string; }[];
  selectedPreconfig?: string;
}

export function PreconfigSelector(props: Props) {

  const MAX_AROUND = 2;

  const [startX, setStartX] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const arr = props.preconfigs ?? [];
    const i = arr.findIndex(p => p.name === props.selectedPreconfig);
    setSelectedIndex(0 <= i ? i : 0);
  }, [props.preconfigs, props.selectedPreconfig]);

  useEffect(() => {
    const mouseMove = (e: MouseEvent | TouchEvent) => {
      if (startX === null) { return; }
      const deltaX = (e instanceof MouseEvent ? e : e.touches[0]).clientX - startX;
      const deltaIndex = convertDeltaXToConfigDelta(deltaX);
      if (deltaIndex !== 0) {
        const count = (props.preconfigs ?? []).length;
        const selected = selectedIndex + deltaIndex;
        setSelectedIndex((selected + count) % count);
        setStartX(startX + deltaX);
      }
    };
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchmove', mouseMove);
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', mouseMove);
    }
  }, [startX, selectedIndex, props.preconfigs]);

  useEffect(() => {
    const mouseUp = () => {
      if (startX === null) { return; }
      const selectedPreconfig = (props.preconfigs ?? [])[selectedIndex];
      setTimeout(() => preconfigService.selectByName(selectedPreconfig?.name), 300);
      setStartX(null);
    };
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchend', mouseUp);
    return () => {
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchend', mouseUp);
    }
  }, [startX, props.preconfigs]);

  function convertDeltaXToConfigDelta(dX: number): number {
    return -1 * Math.sign(dX) * Math.floor(Math.abs(dX) / 50);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    const event: { clientX: number } = e.type === 'mousedown' ? e : (e as any).touches[0];
    setStartX(event.clientX);
  }

  function calculateMinDelta(index: number, count: number): number {
    return [index - count, index + count].reduce((minDelta, e) => Math.abs(e) < Math.abs(minDelta) ? e : minDelta, index);
  }

  return (
    <div className="preconfig-selector">
      <div className="preconfig-prev">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_LEFT}
          onClick={() => preconfigService.selectNext(-1)}
        />
      </div>
      <div
        className="preconfig-overview"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="wrapper">
          {(props.preconfigs ?? []).map((preconfig, i, arr) => {
            const delta = calculateMinDelta(i - selectedIndex, arr.length);
            const p = Math.max(-MAX_AROUND - 1, Math.min(MAX_AROUND + 1, delta));
            const angle = p / MAX_AROUND * Math.PI / 2 * 0.5;
            const scale = Math.max(0, (MAX_AROUND + 1 - Math.abs(p)) / (MAX_AROUND + 1));
            const offset = Math.sin(p / (MAX_AROUND + 1) * Math.PI / 2) * 300;
            const visible = Math.abs(delta) <= MAX_AROUND;
            return <div
              key={preconfig.name}
              className="preconfig-item"
              style={{
                left: `${offset}px`,
                transform: `translate(-50%,-50%) scale(${scale}) rotateY(${angle}rad) `,
                opacity: visible ? 1 : 0,
              }}
            >
              <a onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedIndex(i);
                setTimeout(() => preconfigService.selectByName(preconfig.name), 300);
              }}>
                <div>{preconfig.name}</div>
                <img
                  draggable="false"
                  className="preview"
                  src={`data:image/svg+xml;base64,${window.btoa(preconfig.svg)}`} />
              </a>
            </div>
          })}
        </div>
      </div>
      <div className="preconfig-next">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_RIGHT}
          onClick={() => preconfigService.selectNext(+1)}
        />
      </div>
    </div >
  );
}
