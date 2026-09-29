import React from 'react';

interface Props {
  svgKey: string;
  svgContent?: string;
}

export function SvgCanvas(props: Props) {
  const key = props.svgKey;
  const svgContent = props.svgContent ?? '';
  return (
    <div className="svg-canvas">
      {process.env.MODE === 'production' ? (
        <img key={key} alt="generated SVG" src={`data:image/svg+xml;base64,${window.btoa(svgContent)}`} />
      ) : (
        <div key={key} className="svg-debug-container" style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: svgContent }} />
      )}
    </div>
  );
}
