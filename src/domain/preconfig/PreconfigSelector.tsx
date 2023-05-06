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

  const [startX, setStartX] = useState<number | null>(null);
  const [deltaX, setDeltaX] = useState<number>(0);

  useEffect(() => {
    setDeltaX(0);
  }, [props.selectedPreconfig, props.preconfigs]);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      if (startX === null) { return; }
      setDeltaX(e.clientX - startX);
    };
    window.addEventListener('mousemove', mouseMove);
    return () => window.removeEventListener('mousemove', mouseMove);
  }, [startX]);

  useEffect(() => {
    const mouseUp = (e: MouseEvent) => {
      if (startX === null) { return; }
      if (10 < Math.abs(deltaX)) {
        preconfigService.selectNext(convertDeltaXToConfigDelta(deltaX));
      }
      setStartX(null);
    };
    window.addEventListener('mouseup', mouseUp);
    return () => window.removeEventListener('mouseup', mouseUp);
  }, [startX, deltaX]);


  const origPreconfigs = props.preconfigs ?? [];
  const origSelectedIndex = origPreconfigs.findIndex(p => p.name === props.selectedPreconfig) + convertDeltaXToConfigDelta(deltaX);
  const origCount = origPreconfigs.length;

  const wrappedPreconfigs = [...origPreconfigs, ...origPreconfigs, ...origPreconfigs];
  const wrappedSelectedIndex = origCount + (origSelectedIndex < 0 ? 0 : origSelectedIndex);
  const aroundCount = Math.floor((origCount - 1) / 2);
  const wrappedStart = wrappedSelectedIndex - aroundCount;
  const wrappedEnd = wrappedSelectedIndex + 1 + aroundCount;

  const preconfigs = wrappedPreconfigs.slice(wrappedStart, wrappedEnd);
  const selectedIndex = Math.floor(preconfigs.length / 2);
  const maxAround = 2;

  function convertDeltaXToConfigDelta(dX: number): number {
    return -1 * Math.sign(dX) * Math.floor(Math.abs(dX) / 50);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setDeltaX(0);
    setStartX(e.clientX);
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
      >
        <div className="wrapper">
          {preconfigs.map((preconfig, i) => {
            const isSelected = i === selectedIndex;
            const p = Math.max(-maxAround - 1, Math.min(maxAround + 1, Math.ceil(i - (preconfigs.length / 2))));
            const angle = p / maxAround * Math.PI / 2 * 0.8;
            const offset = Math.sin(p / (maxAround + 1) * Math.PI / 2) * 300;
            const visible = selectedIndex - maxAround <= i && i <= selectedIndex + maxAround;
            return <div
              key={preconfig.name}
              className="preconfig-item"
              style={{
                left: `${offset}px`,
                transform: `rotateY(${angle}rad) translate(-50%,-50%)`,
                opacity: visible ? 1 : 0,
              }}
            >
              <a onClick={() => preconfigService.selectByName(preconfig.name)}>
                <div>{preconfig.name}</div>
                <img
                  style={{ width: `${isSelected ? 120 : 80}px` }}
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
