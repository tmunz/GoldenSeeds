import React, { createRef, useState, useEffect } from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ExporterData } from '../tools/Toolbar';

interface Props {
  getData: () => ExporterData;
}

export function PngExporter(props: Props) {
  const initialData = {
    svg: '',
    dimensions: { width: 1, height: 1 },
    name: 'unknown',
  };
  const exportPngElement = createRef<HTMLAnchorElement>();
  const canvas = createRef<HTMLCanvasElement>();

  const [data, setData] = useState(initialData);

  useEffect(() => {
    drawImageOnCanvas(data, () => {
      exportPng();
      resetCanvas();
    });
  }, [data]);

  const drawImageOnCanvas = (data: ExporterData, onCompletion: () => void) => {
    const context = canvas.current!.getContext('2d');
    const image = new Image();
    image.src = `data:image/svg+xml;base64,${window.btoa(data.svg)}`;
    image.onload = () => {
      context!.drawImage(image, 0, 0);
      onCompletion();
    };
  };

  const exportPng = () => {
    const dataUrl = canvas.current!.toDataURL('image/png');
    exportPngElement.current!.download = data.name + '.png';
    exportPngElement.current!.href = dataUrl;
    exportPngElement.current!.click();
  };

  const resetCanvas = () => {
    canvas.current!.getContext('2d')!.clearRect(0, 0, data.dimensions.width, data.dimensions.height);
    setData(initialData);
  };

  return (
    <div>
      <a target="_blank" onClick={(e) => setData(props.getData())}>
        <AnimatedButton rotation={AnimatedButton.DIRECTION_DOWN} title="save" iconText="png" />
      </a>
      <div style={{ display: 'none' }}>
        <a ref={exportPngElement}></a>
        <canvas ref={canvas} width={data.dimensions.width} height={data.dimensions.height}>
          Your browser does not support the PNG export
        </canvas>
      </div>
    </div>
  );
}
