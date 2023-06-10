import React, { createRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ExporterData } from '../tools/Toolbar'; // TODO
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';

interface Props {
  getData: () => ExporterData;
}

export function PngExporter(props: Props) {
  const INITIAL_DATA = useMemo(() => ({
    svg: '',
    dimensions: { width: 1, height: 1 },
    name: 'unknown',
  }), []);
  const exportElement = createRef<HTMLAnchorElement>();
  const canvas = createRef<HTMLCanvasElement>();

  const [data, setData] = useState(INITIAL_DATA);

  const drawImageOnCanvas = useCallback((onCompletion: () => void) => {
    const context = canvas.current?.getContext('2d');
    if (context) {
      const image = new Image();
      image.src = `data:image/svg+xml;base64,${window.btoa(data.svg)}`;
      image.onload = () => {
        context.drawImage(image, 0, 0);
        onCompletion();
      };
    }
  }, [canvas, data.svg]);

  const exportPng = useCallback(() => {
    const exportElem = exportElement.current;
    const canvasElem = canvas.current;
    if (exportElem && canvasElem) {
      const dataUrl = canvasElem.toDataURL('image/png');
      exportElem.download = data.name + '.png';
      exportElem.href = dataUrl;
      exportElem.click();
    }
  }, [canvas, exportElement, data.name]);

  const resetCanvas = useCallback(() => {
    const context = canvas.current?.getContext('2d');
    if (context) {
      context.clearRect(0, 0, data.dimensions.width, data.dimensions.height);
      setData(INITIAL_DATA);
    }
  }, [canvas, data.dimensions, INITIAL_DATA]);

  useEffect(() => {
    drawImageOnCanvas(() => {
      exportPng();
      resetCanvas();
    });
  }, [data, drawImageOnCanvas, exportPng, resetCanvas]);

  return (
    <>
      <AnimatedButton
        onClick={() => setData(props.getData())}
        points={[SaveNone, SaveRegular, SaveProgress]}
        title="export" iconText="png"
      />
      <a target="_blank" href="#_" ref={exportElement} style={{ display: 'none' }}>helper element for download</a>
      <canvas style={{ display: 'none' }} ref={canvas} width={data.dimensions.width} height={data.dimensions.height}>
        Your browser does not support the PNG export
      </canvas>
    </>
  );
}
