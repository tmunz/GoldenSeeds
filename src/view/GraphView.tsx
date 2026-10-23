import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGraphAnimation } from '../domain/animation/useGraphAnimation';
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

import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { useDimension } from '../utils/useDimension';
import { EditorClose, EditorNone, EditorRegular } from '../ui/icon/Editor';

import './GraphView.styl';


/** Drawing preview with a collapsible node editor. */
export function GraphView(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
}) {
  const [editMode, setEditMode] = useState(false);
  const animation = useGraphAnimation(props.activeConfig?.graph);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimension(mainContentRef);
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);
  const [{ canUndo, canRedo }, setHistoryState] = useState({ canUndo: false, canRedo: false });

  const undo = useCallback(() => canUndo && graphCanvasRef.current?.undo(), [canUndo]);
  const redo = useCallback(() => canRedo && graphCanvasRef.current?.redo(), [canRedo]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (!editMode || (target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select'))) ||
        !(event.ctrlKey || event.metaKey)) {
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
  }, [undo, redo, editMode]);

  const getExporterData = () => ({
    name: props.activeConfig?.meta.name ?? 'drawing',
    svg: props.activeConfig ? renderGraphToSvg(animation.graph, 1000, 1000) : '',
    dimensions: { width: 1000, height: 1000 },
  });

  const preview = useMemo(() => props.activeConfig
    ? renderGraphToSvg(animation.graph, (dimensions?.width ?? 100) * 0.8, (dimensions?.height ?? 100) * 0.8)
    : '', [props.activeConfig, animation.graph, dimensions?.width, dimensions?.height]);

  const name = props.activeConfig?.meta?.name;

  return (
    <div className={'graph-view' + (editMode ? ' edit-mode' : '')}>
      <AnimatedButton
        className="edit-button"
        points={[EditorNone, EditorRegular, EditorClose]}
        active={editMode}
        onClick={() => setEditMode(open => !open)}
      />
      {props.activeConfig && (
        <>
          <aside className="sidebar" aria-label="Node editor" aria-hidden={!editMode}>
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
            <section className="graph-main" aria-label="Node graph">
              <GraphCanvas
                ref={graphCanvasRef}
                key={props.activeConfig.meta.name}
                graph={props.activeConfig.graph}
                animation={animation}
                layout={props.activeConfig.layout}
                onGraphChange={(graph, layout) => configService.setGraph(graph, layout)}
                onHistoryChange={setHistoryState}
              />
            </section>
          </aside>
        </>
      )}
      <section className="main-content" ref={mainContentRef} aria-label="Drawing preview">
        {props.activeConfig && <SvgCanvas svgKey={name ?? 'drawing'} svgContent={preview} />}
        <div className="preconfig-bar">
          <CarouselSelector
            items={props.configItems}
            selected={props.activeConfig?.meta.name}
            select={id => configManager.select(id)}
            scale={3}
          />
        </div>
      </section>
      <Themer />
    </div>
  );
}


