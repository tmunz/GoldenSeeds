import React, { useEffect, useState, MutableRefObject } from 'react';

import './Collapsable.styl';

export function Collapsable({ show, children }: { show: boolean; children: React.ReactNode }) {
  const ref: MutableRefObject<HTMLDivElement | null> = React.useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (element !== null) {
      setHeight(element.scrollHeight);
    }
  }, []);

  return (
    <div className="collapsable" style={{ height: show ? height : 0 }}>
      <div className={`collapsible-content ${show ? 'collapsable-show' : ''}`} ref={ref}>
        {children}
      </div>
    </div>
  );
}
