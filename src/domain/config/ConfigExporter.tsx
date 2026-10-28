import React from 'react';
import { Config } from './Config';
import { toRawConfig } from '../graph/GraphSerializer';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';
import { downloadFile } from '../../utils/Download';

export function ConfigExporter({ config }: { config: Config }) {
  return <AnimatedButton
    points={[SaveNone, SaveRegular, SaveProgress]}
    title="export"
    iconText="json"
    onClick={() => downloadFile(`${config.meta.name}.json`, new Blob(
      [JSON.stringify(toRawConfig(config), null, 2)], { type: 'application/json' },
    ))}
  />;
}
