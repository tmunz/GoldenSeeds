import React, { useRef } from 'react';
import { useTranslation } from '../../i18n/I18n';

import { AnimatedButton } from '../../ui/AnimatedButton';
import { configManager } from './ConfigManager';
import { configService } from './ConfigService';
import { ConfigImportError, findSuspiciousExpressions, parseRawConfig } from './ConfigValidation';
import { LoadProgress, LoadRegular, LoadNone } from '../../ui/icon/Load';

export function ConfigImporter(props: { onLoad?: () => void; label?: string }) {
  const { t } = useTranslation();
  const importConfigElement = useRef<HTMLInputElement | null>(null);

  async function loadConfig(file: File) {
    try {
      const rawConfig = parseRawConfig(await file.text(), file.name.replace(/\.json$/i, ''));
      if (findSuspiciousExpressions(rawConfig).length > 0 && !window.confirm(t('import.unsafeExpression'))) {
        return;
      }
      if (configService.hasUnsavedChanges() && !window.confirm(t('drawing.discardChanges'))) {
        return;
      }
      rawConfig.meta.name = configManager.uniqueName(rawConfig.meta.name);
      await configManager.load(rawConfig);
      props.onLoad?.();
    } catch (error) {
      const message = error instanceof ConfigImportError
        ? t(error.key, error.values)
        : t('import.error.load');
      window.alert(`${t('import.failed')}\n${message}`);
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
