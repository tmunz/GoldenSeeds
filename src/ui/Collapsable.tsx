import React, { useEffect, useState, MutableRefObject } from 'react';

import './Collapsable.styl';

export function Collapsable({ show, children, className }: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ref: MutableRefObject<HTMLDivElement | null> = React.useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (element !== null) {
      setHeight(element.scrollHeight);
    }
  }, [children]);

  return (
    <div className="collapsable" style={{ height: show ? height : 0 }}>
      <div className={`collapsible-content ${show ? 'collapsable-show' : ''} ${className ?? ''}`} ref={ref}>
        {children}
      </div>
    </div>
  );
}
