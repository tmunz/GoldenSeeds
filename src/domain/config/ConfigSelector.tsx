import React, { useState, useEffect } from 'react';

import { RawConfig } from '../config/RawConfig';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { configManager } from './ConfigManager';

import './ConfigSelector.styl';


interface Props {
  configs: { name: string; rawConfig: RawConfig; svg: string | null; }[];
  selectedConfig?: string;
}

export function ConfigSelector(props: Props) {

  const MAX_AROUND = 3;

  const [startX, setStartX] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const arr = props.configs;
    const i = arr.findIndex(p => p.name === props.selectedConfig);
    setSelectedIndex(0 <= i ? i : 0);
  }, [props.configs, props.selectedConfig]);

  useEffect(() => {
    const mouseMove = (e: MouseEvent | TouchEvent) => {
      if (startX === null) { return; }
      const deltaX = (e instanceof MouseEvent ? e : e.touches[0]).clientX - startX;
      const deltaIndex = convertDeltaXToConfigDelta(deltaX);
      if (deltaIndex !== 0) {
        const count = (props.configs ?? []).length;
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
  }, [startX, selectedIndex, props.configs]);

  useEffect(() => {
    const mouseUp = () => {
      if (startX === null) { return; }
      const selectedPreconfig = (props.configs ?? [])[selectedIndex];
      setTimeout(() => configManager.selectByName(selectedPreconfig?.name), 300);
      setStartX(null);
    };
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchend', mouseUp);
    return () => {
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchend', mouseUp);
    }
  }, [startX, props.configs]);

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
    <div className="config-selector">
      <div className="config-prev">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_LEFT}
          onClick={() => configManager.selectByDelta(-1)}
        />
      </div>
      <div
        className={["config-overview", startX === null ? "" : "grabbing"].join(" ")}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {(props.configs ?? []).map((config, i, arr) => {
          const delta = calculateMinDelta(i - selectedIndex, arr.length);
          const p = Math.max(-MAX_AROUND - 1, Math.min(MAX_AROUND + 1, delta));
          const angle = p / MAX_AROUND * Math.PI / 2 * 0.7;
          const scale = 1 / (p == 0 ? 1 : Math.abs(p * 10) ** 0.3);
          const offset = Math.sin(p / (MAX_AROUND + 1) * Math.PI / 2) * 300;
          const visible = Math.abs(delta) <= MAX_AROUND;
          return <div
            key={config.name}
            className="config-item"
            style={{
              transform: `translateX(${offset}px) scale(${scale}) rotateY(${angle}rad)`,
              opacity: visible ? 1 : 0,
            }}
          >
            <a onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedIndex(i);
              setTimeout(() => configManager.selectByName(config.name), 300);
            }}>
              <div>{config.name}</div>
              {config.svg && <img
                draggable="false"
                className="preview"
                src={`data:image/svg+xml;base64,${window.btoa(config.svg)}`} />}
            </a>
          </div>
        })}
      </div>
      <div className="config-next">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_RIGHT}
          onClick={() => configManager.selectByDelta(+1)}
        />
      </div>
    </div >
  );
}