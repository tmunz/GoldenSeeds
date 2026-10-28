import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';
import { downloadFile } from '../../utils/Download';

export function SvgExporter({ getData }: { getData: () => { svg: string; name: string } }) {
  return <AnimatedButton
    points={[SaveNone, SaveRegular, SaveProgress]}
    title="export"
    iconText="svg"
    onClick={() => {
      const { name, svg } = getData();
      downloadFile(`${name}.svg`, new Blob([svg], { type: 'image/svg+xml' }));
    }}
  />;
}
