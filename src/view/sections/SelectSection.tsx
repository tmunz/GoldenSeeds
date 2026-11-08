import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { ConfigItem, configManager } from '../../domain/config/ConfigManager';
import { ConfigImporter } from '../../domain/config/ConfigImporter';
import { configService } from '../../domain/config/ConfigService';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { CarouselSelector } from '../../ui/CarouselSelector';
import { Frame } from '../../ui/Frame';
import { confirmDialog } from '../../ui/DialogService';
import { SelectNone, SelectRegular, SelectClose } from '../../ui/icon/animated/Select';
import { EditorNone, EditorRegular, EditorClose } from '../../ui/icon/animated/Editor';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/animated/Plus';

import './SelectSection.css';

export function SelectSection(props: {
  configItems: ConfigItem[];
  activeName?: string;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const [selectedName, setSelectedName] = useState<string>();
  const selection = props.configItems.find(item => item.name === selectedName)
    ?? props.configItems.find(item => item.name === props.activeName)
    ?? props.configItems[0];

  async function confirmDiscard(): Promise<boolean> {
    return !configService.hasUnsavedChanges() || await confirmDialog(t('drawing.discardChanges'), {
      title: t('dialog.unsaved'), confirmLabel: t('actions.discard'),
    });
  }

  async function editSelected() {
    if (!selection) return;
    if (selection.name !== props.activeName && !await confirmDiscard()) return;
    await configManager.select(selection.name, { reload: false });
    props.onEdit();
  }

  async function createDrawing() {
    if (!await confirmDiscard()) return;
    const names = new Set([...props.configItems.map(item => item.name), props.activeName]);
    const untitled = t('drawing.untitled');
    let name = untitled;
    let suffix = 2;
    while (names.has(name)) name = `${untitled} ${suffix++}`;
    await configService.setRawConfig({ meta: { name }, nodes: [], edges: [] });
    props.onEdit();
  }

  return (
    <Frame
      step="01"
      className="select-column"
      title={t('sections.select')}
      label={t('sections.selectLabel')}
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
            onActivate={editSelected}
            selectionDelay={0}
            scale={1.5}
          />
        </div>
        <div className="selection-actions" role="group" aria-label={t('drawing.actions')}>
          <ConfigImporter label={t('actions.load')} onLoad={props.onEdit} />
          <AnimatedButton
            title={t('actions.edit')}
            iconText={t('actions.selected')}
            points={[EditorNone, EditorRegular, EditorClose]}
            disabled={!selection}
            onClick={editSelected}
          />
          <AnimatedButton
            title={t('actions.create')}
            iconText={t('actions.new')}
            points={[PlusNone, PlusRegular, PlusRotated]}
            onClick={() => { void createDrawing(); }}
          />
        </div>
      </div>
    </Frame>
  );
}
