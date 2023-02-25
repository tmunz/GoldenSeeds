import React, { useEffect, useState } from 'react';

import './Collapsable.styl';

export function Collapsable({
  show,
  children,
}: {
  show: boolean;
  children: any;
}) {
  const ref = React.useRef(null);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    setHeight(ref.current.scrollHeight);
  });

  return (
    <div className="collapsable" style={{ height: show ? height : 0 }}>
      <div
        className={`collapsible-content ${show ? 'collapsable-show' : ''}`}
        ref={ref}
      >
        {children}
      </div>
    </div>
  );
}
