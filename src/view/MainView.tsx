import React, { useEffect, useState } from 'react';
import { useGraphAnimation } from '../domain/animation/useGraphAnimation';
import { Config } from '../domain/config/Config';
import { ConfigItem } from '../domain/config/ConfigManager';
import { Settings } from '../settings/Settings';
import { ExportSection } from './sections/ExportSection';
import { EditSection } from './sections/EditSection';
import { ViewerSection } from './sections/ViewerSection';
import { SelectSection } from './sections/SelectSection';

import './MainView.css';

export function MainView(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
  initialViewerOpen?: boolean;
}) {
  const [selectMode, setSelectMode] = useState(!props.initialViewerOpen);
  const [editMode, setEditMode] = useState(false);
  const [viewerMode, setViewerMode] = useState(Boolean(props.initialViewerOpen));
  const [exportMode, setExportMode] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const change = () => setCompact(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!compact) return;
    // On smaller screens keep one usable workspace and the four steps in reach.
    if (editMode) { setSelectMode(false); setViewerMode(false); setExportMode(false); }
    else if (viewerMode) { setSelectMode(false); setExportMode(false); }
    else if (exportMode) setSelectMode(false);
  }, [compact, editMode, viewerMode, exportMode]);

  function toggleStep(step: 'select' | 'edit' | 'view' | 'export') {
    if (compact) {
      setSelectMode(step === 'select' && !selectMode);
      setEditMode(step === 'edit' && !editMode);
      setViewerMode(step === 'view' && !viewerMode);
      setExportMode(step === 'export' && !exportMode);
      return;
    }
    if (step === 'select') setSelectMode(open => !open);
    if (step === 'edit') setEditMode(open => !open);
    if (step === 'view') setViewerMode(open => !open);
    if (step === 'export') setExportMode(open => !open);
  }

  const animation = useGraphAnimation(props.activeConfig?.graph);

  function openEditor() {
    setSelectMode(false);
    setViewerMode(!compact);
    if (compact) setExportMode(false);
    setEditMode(true);
  }

  return (
    <div
      className="main-view"
      style={{
        gridTemplateColumns: [
          selectMode ? 'minmax(48px, 1fr)' : 'minmax(48px, 0fr)',
          editMode ? 'minmax(48px, 2fr)' : 'minmax(48px, 0fr)',
          viewerMode ? 'minmax(48px, 2fr)' : 'minmax(48px, 0fr)',
          exportMode ? 'minmax(48px, 1fr)' : 'minmax(48px, 0fr)',
        ].join(' '),
      }}
    >
      <SelectSection
        configItems={props.configItems}
        activeName={props.activeConfig?.meta.name}
        open={selectMode}
        onToggle={() => toggleStep('select')}
        onEdit={openEditor}
      />
      <EditSection
        configItems={props.configItems}
        configsManageable={props.configsManageable}
        activeConfig={props.activeConfig}
        animation={animation}
        open={editMode}
        showResultPreview={!viewerMode}
        onToggle={() => toggleStep('edit')}
      />
      <ViewerSection
        activeConfig={props.activeConfig}
        graph={animation.graph}
        animating={animation.frames.length > 0}
        open={viewerMode}
        onToggle={() => toggleStep('view')}
      />
      <ExportSection
        activeConfig={props.activeConfig}
        graph={animation.graph}
        open={exportMode}
        onToggle={() => toggleStep('export')}
      />
      <Settings />
    </div>
  );
}
