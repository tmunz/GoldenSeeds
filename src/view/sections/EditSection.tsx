import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GraphAnimationControls } from '../../domain/animation/useGraphAnimation';
import { Config } from '../../domain/config/Config';
import { ConfigItem } from '../../domain/config/ConfigManager';
import { ConfigManagerUi } from '../../domain/config/ConfigManagerUi';
import { configService } from '../../domain/config/ConfigService';
import { GraphCanvas, GraphCanvasHandle } from '../../domain/graph/GraphCanvas';
import { AnimatedButton, DIRECTION_LEFT, DIRECTION_RIGHT } from '../../ui/AnimatedButton';
import { ArrowNone, ArrowFlat, ArrowRegular } from '../../ui/icon/Arrow';
import { Frame } from '../../ui/Frame';
import { EditorNone, EditorRegular, EditorClose } from '../../ui/icon/Editor';

import './EditSection.css';

export function EditSection(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
  animation: GraphAnimationControls;
  open: boolean;
  showResultPreview: boolean;
  onToggle: () => void;
}) {
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);
  const [{ canUndo, canRedo }, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const undo = useCallback(() => canUndo && graphCanvasRef.current?.undo(), [canUndo]);
  const redo = useCallback(() => canRedo && graphCanvasRef.current?.redo(), [canRedo]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (!props.open || (target instanceof HTMLElement &&
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
  }, [undo, redo, props.open]);

  return (
    <Frame
      className="edit-column"
      title="edit"
      label="Node editor"
      iconPaths={[EditorNone, EditorRegular, EditorClose]}
      open={props.open}
      onToggle={props.onToggle}
    >
      {props.activeConfig && (
        <>
          <div className="actions">
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
              graph={props.activeConfig.graph}
              animation={props.animation}
              layout={props.activeConfig.layout}
              showResultPreview={props.showResultPreview}
              onGraphChange={(graph, layout) => configService.setGraph(graph, layout)}
              onHistoryChange={setHistoryState}
            />
          </section>
        </>
      )}
    </Frame>
  );
}
