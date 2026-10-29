import React, { useState } from 'react';
import { ConfigItem, configManager } from '../../domain/config/ConfigManager';
import { ConfigImporter } from '../../domain/config/ConfigImporter';
import { configService } from '../../domain/config/ConfigService';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { CarouselSelector } from '../../ui/CarouselSelector';
import { Frame } from '../../ui/Frame';
import { SelectNone, SelectRegular, SelectClose } from '../../ui/icon/Select';
import { EditorNone, EditorRegular, EditorClose } from '../../ui/icon/Editor';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';

import './SelectSection.css';

export function SelectSection(props: {
  configItems: ConfigItem[];
  activeName?: string;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const [selectedName, setSelectedName] = useState<string>();
  const selection = props.configItems.find(item => item.name === selectedName)
    ?? props.configItems.find(item => item.name === props.activeName)
    ?? props.configItems[0];

  function editSelected() {
    if (!selection) return;
    configManager.select(selection.name, { reload: false });
    props.onEdit();
  }

  async function createDrawing() {
    const names = new Set([...props.configItems.map(item => item.name), props.activeName]);
    let name = 'Untitled';
    let suffix = 2;
    while (names.has(name)) name = `Untitled ${suffix++}`;
    await configService.setRawConfig({ meta: { name }, nodes: [], edges: [] });
    props.onEdit();
  }

  return (
    <Frame
      className="select-column"
      title="select"
      label="Select drawing"
      iconPaths={[SelectNone, SelectRegular, SelectClose]}
      open={props.open}
      onToggle={props.onToggle}
    >
      <div className="selection-content">
        <div className="selection-overview">
          <CarouselSelector
            items={props.configItems}
            selected={selection?.name}
            select={setSelectedName}
            selectionDelay={0}
            scale={1.5}
          />
        </div>
        <div className="selection-actions" role="group" aria-label="Drawing actions">
          <ConfigImporter label="load" onLoad={props.onEdit} />
          <AnimatedButton
            title="edit"
            iconText="selected"
            points={[EditorNone, EditorRegular, EditorClose]}
            disabled={!selection}
            onClick={editSelected}
          />
          <AnimatedButton
            title="create"
            iconText="new"
            points={[PlusNone, PlusRegular, PlusRotated]}
            onClick={() => { void createDrawing(); }}
          />
        </div>
      </div>
    </Frame>
  );
}
