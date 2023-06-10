import React, { createRef } from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';

interface Props {
  getData: () => {
    svg: string,
    name: string,
  };
}

export function SvgExporter(props: Props) {
  const exportSvgElement = createRef<HTMLAnchorElement>();

  return (
    <>
      <AnimatedButton
        points={[SaveNone, SaveRegular, SaveProgress]}
        title="export"
        iconText="svg"
        onClick={() => exportSvg(props, exportSvgElement.current)}
      />
      <a target="_blank" href="#_" ref={exportSvgElement} style={{ display: 'none' }}>helper element for download</a>
    </>
  );
}

function exportSvg(props: Props, exportSvgElement: HTMLAnchorElement | null) {
  const data = props.getData();
  if (exportSvgElement) {
    const fileName = data.name + '.svg';
    exportSvgElement.download = fileName;
    exportSvgElement.href = URL.createObjectURL(new File([data.svg ?? ''], fileName, { type: 'image/svg+xml' }));
    exportSvgElement.click();
  }
}
