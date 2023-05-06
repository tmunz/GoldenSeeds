import React, { createRef } from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ExporterData } from '../tools/Toolbar'; // TODO
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';

interface Props {
  getData: () => ExporterData;
}

export function SvgExporter(props: Props) {
  const exportSvgElement = createRef<HTMLAnchorElement>();

  return (
    <div>
      <a target="_blank" ref={exportSvgElement} onClick={() => exportSvg(props, exportSvgElement.current)}>
        <AnimatedButton points={[SaveNone, SaveRegular, SaveProgress]} title="export" iconText="svg" />
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
