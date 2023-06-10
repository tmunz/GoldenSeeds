import React, { createRef } from 'react';
import { Config } from '../config/Config';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ConfigService } from './ConfigService';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';

export function ConfigExporter(props: {
  config?: Config;
}) {
  const exportConfigElement = createRef<HTMLAnchorElement>();

  function exportConfig() {
    if (props.config) {
      const json = ConfigService.convertConfigToRawConfig(props.config);
      if (exportConfigElement.current) {
        exportConfigElement.current.download = json.meta.name + '.json';
        exportConfigElement.current.href = URL.createObjectURL(
          new File([JSON.stringify(json, null, 2)], json.meta.name + '.json', {
            type: 'text/json',
          }),
        );
        exportConfigElement.current.click();
      }
    }
  }

  return (
    <>
      <AnimatedButton
        points={[SaveNone, SaveRegular, SaveProgress]}
        onClick={() => exportConfig()}
        title="export"
        iconText="json"
      />
      <a target="_blank" href="#_" ref={exportConfigElement} style={{ display: 'none' }}>helper element for download</a>
    </>
  );
}
