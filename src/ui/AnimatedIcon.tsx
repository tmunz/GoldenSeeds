import React, { useRef, useEffect, useState } from 'react';

import './AnimatedIcon.styl';

export interface Props {
  points: (number[][][] | string[]);
  index: number;
  rotation?: number
}


export function AnimatedIcon(props: Props) {

  const [index, setIndex] = useState(null);

  const refs = (props.points as any[]).map(() => useRef(null));

  useEffect(() => {
    if (index !== props.index) {
      setIndex(props.index);
      refs[props.index].current.beginElement();
    }
  });

  const toPath = (ps: number[][] | string) => {
    return typeof ps === "string" ? ps : ps.reduce((agg, p) => agg + ` ${p[0]},${p[1]}`, "");
  }

  return <svg viewBox="0 0 100 100" className="animated-icon">
    <polyline
      className="icon"
      points={toPath(props.points[0])}
      transform={`rotate(${props.rotation ? props.rotation : 0} 50 50)`}
      vectorEffect="non-scaling-stroke"
    >
      {
        (props.points as any[]).map((points: string | number[][], i: number) => <animate
          key={i}
          begin="indefinite"
          fill="freeze"
          attributeName="points"
          dur="500ms"
          ref={refs[i]}
          to={toPath(points)}
        />)
      }

    </polyline>
  </svg>;
}
