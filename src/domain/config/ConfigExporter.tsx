import React from 'react';
import { useTranslation } from '../../i18n/I18n';
import { Config } from './Config';
import { toRawConfig } from '../graph/runtime/GraphSerializer';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';
import { downloadFile } from '../../utils/Download';

export function ConfigExporter({ config }: { config: Config }) {
  const { t } = useTranslation();
  return <AnimatedButton
    points={[SaveNone, SaveRegular, SaveProgress]}
    title={t('actions.export')}
    iconText="json"
    onClick={() => downloadFile(`${config.meta.name}.json`, new Blob(
      [JSON.stringify(toRawConfig(config), null, 2)], { type: 'application/json' },
    ))}
  />;
}
