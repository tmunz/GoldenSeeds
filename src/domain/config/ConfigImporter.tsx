import React, { useRef } from 'react';

import { AnimatedButton } from '../../ui/AnimatedButton';
import { configService } from './ConfigService';
import { LoadProgress, LoadRegular, LoadNone } from '../../ui/icon/Load';

export function ConfigImporter() {
  const importConfigElement = useRef<HTMLInputElement | null>(null);

  function loadConfig(file: Blob) {
    if (typeof file !== 'undefined') {
      const fileReader = new FileReader();
      fileReader.onload = (event) => configService.setRawConfig(JSON.parse(event.target?.result as string));
      fileReader.readAsText(file);
    }
  }

  function openConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob | null = (event.target.files ?? [])[0];
    const elem = importConfigElement.current;
    if (file && elem) {
      loadConfig(file);
      elem.value = '';
    }
  }

  return (
    <>
      <AnimatedButton
        points={[LoadNone, LoadRegular, LoadProgress]}
        title="import"
        iconText="json"
        onClick={() => (importConfigElement as unknown as HTMLElement)?.click()}
      />
      <input
        ref={importConfigElement}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => openConfig(event)}
      />
    </>
  );
}
