import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { ConfigItem, configManager } from '../domain/config/ConfigManager';
import { configService } from '../domain/config/ConfigService';
import { TextInput } from '../ui/input/TextInput';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { ConfigManagerUi } from '../domain/config/ConfigManagerUi';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { PngExporter } from '../domain/png/PngExporter';
import { GraphCanvas, GraphCanvasHandle } from '../domain/graph/GraphCanvas';
import { renderGraphToSvg } from '../domain/graph/GraphRenderer';
import { CarouselSelector } from '../ui/CarouselSelector';
import { AnimatedButton, DIRECTION_LEFT, DIRECTION_RIGHT } from '../ui/AnimatedButton';
import { ArrowNone, ArrowRegular, ArrowFlat } from '../ui/icon/Arrow';

import './GraphView.styl';


/**
 * Top-level view built around the node-graph editor (see GraphCanvas). It replaces the
 * previous linear stage Editor: instead of a fixed list of stages with sliders, the drawing
 * is authored as a graph of generator/value nodes feeding a single, always-present, non-deletable
 * render node (see RenderNode.ts) which shows the resulting SVG.
 */
export function GraphView(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
}) {
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);
  const [{ canUndo, canRedo }, setHistoryState] = useState({ canUndo: false, canRedo: false });

  const undo = useCallback(() => canUndo && graphCanvasRef.current?.undo(), [canUndo]);
  const redo = useCallback(() => canRedo && graphCanvasRef.current?.redo(), [canRedo]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const getExporterData = () => ({
    name: props.activeConfig?.meta.name ?? 'drawing',
    svg: props.activeConfig ? renderGraphToSvg(props.activeConfig.graph, 1000, 1000) : '',
    dimensions: { width: 1000, height: 1000 },
  });

  const name = props.activeConfig?.meta?.name;

  return (
    <div className="graph-view">
      {props.activeConfig && (
        <>
          <div className="actions">
            <ConfigImporter />
            <ConfigExporter config={props.activeConfig} />
            <SvgExporter getData={() => getExporterData()} />
            <PngExporter getData={() => getExporterData()} />
            <TextInput value={name} onChange={(n: string) => configService.setName(n)} label={'name'} />
            {props.configsManageable && (
              <ConfigManagerUi configItems={props.configItems} activeConfig={props.activeConfig} />
            )}
            <AnimatedButton
              title="undo"
              rotation={DIRECTION_LEFT}
              disabled={!canUndo}
              onClick={() => undo()}
              points={[ArrowNone, ArrowFlat, ArrowRegular]}
            />
            <AnimatedButton
              title="redo"
              rotation={DIRECTION_RIGHT}
              disabled={!canRedo}
              onClick={() => redo()}
              points={[ArrowNone, ArrowFlat, ArrowRegular]}
            />
          </div>
          <section className="graph-main">
            <GraphCanvas
              ref={graphCanvasRef}
              key={props.activeConfig.meta.name}
              graph={props.activeConfig.graph}
              layout={props.activeConfig.layout}
              onGraphChange={(graph, layout) => configService.setGraph(graph, layout)}
              onHistoryChange={setHistoryState}
            />
          </section>
        </>
      )}
      <div className="preconfig-bar">
        <CarouselSelector
          items={props.configItems}
          selected={props.activeConfig?.meta.name}
          select={id => configManager.select(id)}
          scale={3}
        />
      </div>
      <Themer />
    </div>
  );
}


