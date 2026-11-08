import React, { useRef } from 'react';
import { useTranslation } from '../../i18n/I18n';

import { AnimatedButton } from '../../ui/AnimatedButton';
import { alertDialog, confirmDialog } from '../../ui/DialogService';
import { configManager } from './ConfigManager';
import { configService } from './ConfigService';
import { ConfigImportError, findSuspiciousExpressions, parseRawConfig } from './ConfigValidation';
import { LoadProgress, LoadRegular, LoadNone } from '../../ui/icon/animated/Load';

export function ConfigImporter(props: { onLoad?: () => void; label?: string }) {
  const { t } = useTranslation();
  const importConfigElement = useRef<HTMLInputElement | null>(null);

  async function loadConfig(file: File) {
    try {
      const rawConfig = parseRawConfig(await file.text(), file.name.replace(/\.json$/i, ''));
      if (findSuspiciousExpressions(rawConfig).length > 0 && !await confirmDialog(t('import.unsafeExpression'))) {
        return;
      }
      if (configService.hasUnsavedChanges() && !await confirmDialog(t('drawing.discardChanges'), {
        title: t('dialog.unsaved'), confirmLabel: t('actions.discard'),
      })) {
        return;
      }
      rawConfig.meta.name = configManager.uniqueName(rawConfig.meta.name);
      await configManager.load(rawConfig);
      props.onLoad?.();
    } catch (error) {
      const message = error instanceof ConfigImportError
        ? t(error.key, error.values)
        : t('import.error.load');
      await alertDialog(message, { title: t('import.failed') });
    }
  }

  function openConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const elem = importConfigElement.current;
    if (file && elem) {
      void loadConfig(file);
      elem.value = '';
    }
  }

  return (
    <>
      <AnimatedButton
        points={[LoadNone, LoadRegular, LoadProgress]}
        title={props.label ?? t('actions.import')}
        iconText="json"
        onClick={() => {
          importConfigElement.current?.click();
        }}
      />
      <input
        ref={importConfigElement}
        type="file"
        accept=".json,application/json"
        aria-label={t('drawing.import')}
        style={{ display: 'none' }}
        onChange={(event) => openConfig(event)}
      />
    </>
  );
}
