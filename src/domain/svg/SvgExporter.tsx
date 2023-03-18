import React, { createRef } from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ExporterData } from '../tools/Toolbar';

interface Props {
  getData: () => ExporterData;
}

export function SvgExporter(props: Props) {
  const exportSvgElement = createRef<HTMLAnchorElement>();

  return (
    <div>
      <a target="_blank" ref={exportSvgElement} onClick={() => exportSvg(props, exportSvgElement.current)}>
        <AnimatedButton rotation={AnimatedButton.DIRECTION_DOWN} title="save" iconText="svg" />
      </a>
    </div>
  );
}

function exportSvg(props: Props, exportSvgElement: HTMLAnchorElement | null) {
  const data = props.getData();
  if (exportSvgElement) {
    const fileName = data.name + '.svg';
    exportSvgElement.download = fileName;
    exportSvgElement.href = URL.createObjectURL(new File([data.svg ?? ''], fileName, { type: 'image/svg+xml' }));
  }
}
