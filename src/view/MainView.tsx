import React, { useState } from 'react';
import { useGraphAnimation } from '../domain/animation/useGraphAnimation';
import { Config } from '../domain/config/Config';
import { ConfigItem } from '../domain/config/ConfigManager';
import { Themer } from '../themer/Themer';
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
  const animation = useGraphAnimation(props.activeConfig?.graph);

  function openEditor() {
    setSelectMode(false);
    setViewerMode(true);
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
          exportMode ? 'minmax(48px, 0.35fr)' : 'minmax(48px, 0fr)',
        ].join(' '),
      }}
    >
      <SelectSection
        configItems={props.configItems}
        activeName={props.activeConfig?.meta.name}
        open={selectMode}
        onToggle={() => setSelectMode(open => !open)}
        onEdit={openEditor}
      />
      <EditSection
        configItems={props.configItems}
        configsManageable={props.configsManageable}
        activeConfig={props.activeConfig}
        animation={animation}
        open={editMode}
        showResultPreview={!viewerMode}
        onToggle={() => setEditMode(open => !open)}
      />
      <ViewerSection
        activeConfig={props.activeConfig}
        graph={animation.graph}
        open={viewerMode}
        onToggle={() => setViewerMode(open => !open)}
      />
      <ExportSection
        activeConfig={props.activeConfig}
        graph={animation.graph}
        open={exportMode}
        onToggle={() => setExportMode(open => !open)}
      />
      <Themer />
    </div>
  );
}
