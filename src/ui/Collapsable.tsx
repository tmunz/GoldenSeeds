import React, { useEffect, useState, MutableRefObject, useRef } from 'react';

import './Collapsable.styl';

export function Collapsable({ show, children, className }: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const ref: MutableRefObject<HTMLDivElement | null> = React.useRef(null);
  const [height, setHeight] = useState(0);
  const [visibility, setVisibility] = useState<boolean>(show);

  useEffect(() => {
    const element = ref.current;
    if (element !== null) {
      setHeight(element.scrollHeight);
    }
  }, [visibility, children]);

  useEffect(() => {
    if (show) {
      setVisibility(true);
    } else {
      timeoutIdRef.current && clearInterval(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        setVisibility(false);
      }, 800);
    }
    return () => {
      timeoutIdRef.current && clearInterval(timeoutIdRef.current);
    };
  }, [show]);

  return (
    <div className="collapsable" style={{ height: show ? height : 0, display: visibility ? 'block' : 'none' }}> 
      <div className={`collapsible-content ${show ? 'collapsable-show' : ''} ${className ?? ''}`} ref={ref}>
        {children}
      </div>
    </div>
  );
}
