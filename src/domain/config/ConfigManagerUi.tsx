import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { configManager, ConfigItem } from './ConfigManager';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { ResetNone, ResetRegular, ResetProgress } from '../../ui/icon/Reset';
import { Config } from './Config';
import { configService } from './ConfigService';
import { preconfigs } from './data';
import { toRawConfig } from '../graph/runtime/GraphSerializer';
import { LoadNone, LoadProgress, LoadRegular } from '../../ui/icon/Load';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';
import './ConfigManagerUi.css';

export function ConfigManagerUi({ configItems, activeConfig, hasChanges }: {
  configItems: ConfigItem[];
  activeConfig: Config;
  hasChanges: boolean;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selected = activeConfig.meta.name;
  const configItem = configItems.find(item => item.name === selected);
  const hasPreset = preconfigs.some(config => config.meta.name === selected);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try { await action(); }
    catch { setError('drawing.error'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!await configManager.delete(selected)) { throw new Error('Delete failed'); }
    const next = configItems.find(item => item.name !== selected);
    await configManager.select(next?.name);
  }

  async function save() {
    const sortIndex = configItem?.sortIndex ?? ((configItems[configItems.length - 1]?.sortIndex ?? 0) + 1);
    await configManager.save(toRawConfig(activeConfig), sortIndex);
    configService.markSaved(activeConfig);
    if (configService.config$.value.meta.name === selected) {
      await configManager.select(selected, { reload: false });
    }
  }

  return <div className="config-manager-container">
    <div className="config-manager" aria-label={t('drawing.actions')}>
      {hasPreset && configItem && <AnimatedButton
        points={[ResetNone, ResetRegular, ResetProgress]}
        title={t('actions.reset')}
        disabled={busy} 
        onClick={() => { void act(() => configManager.reset(selected)); }}
      />}
      {configItem && <AnimatedButton
        points={[LoadNone, LoadRegular, LoadProgress]} 
        title={t('actions.reload')}
        disabled={busy || !hasChanges}
        onClick={() => {
          if (window.confirm(t('drawing.discardChanges'))) { void act(() => configManager.select(selected)); }
        }}
      />}
      <AnimatedButton
        points={[SaveNone, SaveRegular, SaveProgress]} 
        title={t('actions.save')} 
        disabled={busy || !hasChanges} onClick={() => { void act(save); }}
      />
      {configItem && !configItem.preconfig && <AnimatedButton
        points={[PlusNone, PlusRegular, PlusRotated]} 
        rotation={45}
        title={t('actions.delete')} 
        disabled={busy} onClick={() => { void act(remove); }}
      />}
    </div>
    {error && <span className="config-manager-error" role="alert">{t(error)}</span>}
  </div>;
}
