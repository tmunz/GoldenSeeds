import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { GraphAnimationControls } from '../../domain/animation/useGraphAnimation';
import { Config } from '../../domain/config/Config';
import { ConfigItem } from '../../domain/config/ConfigManager';
import { ConfigManagerUi } from '../../domain/config/ConfigManagerUi';
import { configService, SaveState } from '../../domain/config/ConfigService';
import { GraphCanvas, GraphCanvasHandle } from '../../domain/graph/editor/GraphCanvas';
import { AnimatedButton, DIRECTION_LEFT, DIRECTION_RIGHT } from '../../ui/AnimatedButton';
import { ArrowNone, ArrowFlat, ArrowRegular } from '../../ui/icon/animated/Arrow';
import { Frame } from '../../ui/Frame';
import { EditorNone, EditorRegular, EditorClose } from '../../ui/icon/animated/Editor';
import { TextInput } from '../../ui/input/TextInput';

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
  const { t } = useTranslation();
  const [saveState, setSaveState] = useState<SaveState>(configService.saveState$.value);
  useEffect(() => {
    const subscription = configService.saveState$.subscribe(setSaveState);
    return () => subscription.unsubscribe();
  }, []);
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);
  const [{ canUndo, canRedo }, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const undo = useCallback(() => canUndo && graphCanvasRef.current?.undo(), [canUndo]);
  const redo = useCallback(() => canRedo && graphCanvasRef.current?.redo(), [canRedo]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (!props.open || event.altKey || (target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select')))) {
        return;
      }
      const canvas = graphCanvasRef.current;
      const key = event.key.toLowerCase();
      if (!(event.ctrlKey || event.metaKey)) {
        if (key === 'f') { canvas?.fit(); }
        return;
      }
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      } else if (key === 'd') {
        event.preventDefault();
        canvas?.duplicate();
      } else if (key === 'c' && !window.getSelection()?.toString()) {
        canvas?.copy();
      } else if (key === 'v') {
        canvas?.paste();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, props.open]);

  return (
    <Frame
      step="02"
      className="edit-column"
      title={t('sections.edit')}
      label={t('sections.editLabel')}
      iconPaths={[EditorNone, EditorRegular, EditorClose]}
      open={props.open}
      onToggle={props.onToggle}
      headerContent={props.activeConfig && (
        <>
          <div className="drawing-status">
            <TextInput value={props.activeConfig.meta.name} onChange={(name) => configService.setName(name)} label={t('drawing.name')} />
            {/* <span className={`save-state save-state-${saveState}`} role="status" aria-live="polite">
              {saveState === 'saved' ? 'saved' : 'unsaved changes'}
            </span> */}
          </div>
          <div className="actions">
            {props.configsManageable && (
              <ConfigManagerUi configItems={props.configItems} activeConfig={props.activeConfig} hasChanges={saveState === 'unsaved'} />
            )}
            <AnimatedButton
              title={t('actions.undo')}
              rotation={DIRECTION_LEFT}
              disabled={!canUndo}
              onClick={() => undo()}
              points={[ArrowNone, ArrowFlat, ArrowRegular]}
            />
            <AnimatedButton
              title={t('actions.redo')}
              rotation={DIRECTION_RIGHT}
              disabled={!canRedo}
              onClick={() => redo()}
              points={[ArrowNone, ArrowFlat, ArrowRegular]}
            />
          </div>
        </>
      )}
    >
      {props.activeConfig && (
        <section className="graph-main" aria-label={t('graph.canvas')}>
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
      )}
    </Frame>
  );
}
