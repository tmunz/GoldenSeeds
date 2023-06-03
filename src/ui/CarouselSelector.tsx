import React, { useState, useEffect } from 'react';
import { AnimatedButton } from './AnimatedButton';

import './CarouselSelector.styl';


interface CarouselSelectorItem {
  name: string;
  svg: string | null;
}

interface Props {
  items: CarouselSelectorItem[];
  selected?: string;
  select: (name: string) => void;
  scale?: number;
  className?: string;
}

export function CarouselSelector(props: Props) {

  const MAX_AROUND = 3;

  const [startX, setStartX] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const arr = props.items;
    const i = arr.findIndex(p => p && p.name === props.selected);
    setSelectedIndex(0 <= i ? i : 0);
  }, [props.items, props.selected]);

  useEffect(() => {
    const mouseMove = (e: MouseEvent | TouchEvent) => {
      if (startX === null) { return; }
      const deltaX = (e instanceof MouseEvent ? e : e.touches[0]).clientX - startX;
      const deltaIndex = convertDeltaXToItemDelta(deltaX);
      if (deltaIndex !== 0) {
        const count = (props.items ?? []).length;
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
    };
  }, [startX, selectedIndex, props.items]);

  useEffect(() => {
    const mouseUp = () => {
      if (startX === null) { return; }
      const selected = (props.items ?? [])[selectedIndex];
      if (selected.name !== props.selected) {
        setTimeout(() => props.select(selected.name), 300);
      }
      setStartX(null);
    };
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchend', mouseUp);
    return () => {
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchend', mouseUp);
    };
  }, [startX, props.items]);

  function convertDeltaXToItemDelta(dX: number): number {
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

  function selectByDelta(delta: number) {
    const nextIndex = (selectedIndex + delta + props.items.length) % props.items.length;
    props.select(props.items[nextIndex].name);
  }

  return (
    <div className={`carousel-selector ${props.className ? props.className : ''}`}>
      <div className="carousel-prev">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_LEFT}
          onClick={() => selectByDelta(-1)}
        />
      </div>
      <div
        className={['carousel-overview', startX === null ? '' : 'grabbing'].join(' ')}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {(props.items ?? []).map((item, i, arr) => {
          const delta = calculateMinDelta(i - selectedIndex, arr.length);
          const p = Math.max(-MAX_AROUND - 1, Math.min(MAX_AROUND + 1, delta));
          const angle = p / MAX_AROUND * Math.PI / 2 * 0.7;
          const scale = 1 / (p == 0 ? 1 : Math.abs(p * 10) ** 0.3);
          const offset = Math.sin(p / (MAX_AROUND + 1) * Math.PI / 2) * 100 * (props.scale ?? 1);
          const visible = Math.abs(delta) <= MAX_AROUND;
          return <div
            key={item.name}
            className="carousel-item"
            style={{
              transform: `translateX(${offset}px) scale(${scale}) rotateY(${angle}rad)`,
              opacity: visible ? 1 : 0,
            }}
          >
            <a onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedIndex(i);
              setTimeout(() => props.select(item.name), 300);
            }}>
              <div>{item.name}</div>
              {item.svg && <img
                draggable="false"
                className="preview"
                src={`data:image/svg+xml;base64,${window.btoa(item.svg)}`} />}
            </a>
          </div>;
        })}
      </div>
      <div className="carousel-next">
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_RIGHT}
          onClick={() => selectByDelta(+1)}
        />
      </div>
    </div >
  );
}
