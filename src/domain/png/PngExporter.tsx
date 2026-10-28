import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';
import { downloadFile } from '../../utils/Download';

export function PngExporter({ getData }: {
  getData: () => { svg: string; dimensions: { width: number; height: number }; name: string };
}) {
  function exportPng() {
    const { name, svg, dimensions } = getData();
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    if (!context) { return; }
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const image = new Image();
    image.onload = () => {
      try {
        context.drawImage(image, 0, 0);
        canvas.toBlob((data) => {
          if (data) { downloadFile(`${name}.png`, data); }
        }, 'image/png');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  return <AnimatedButton onClick={exportPng} points={[SaveNone, SaveRegular, SaveProgress]} title="export" iconText="png" />;
}
