import React, { useRef } from 'react';

import { AnimatedButton } from '../../ui/AnimatedButton';
import { configManager } from './ConfigManager';
import { LoadProgress, LoadRegular, LoadNone } from '../../ui/icon/Load';

export function ConfigImporter(props: { onLoad?: () => void; label?: string }) {
  const importConfigElement = useRef<HTMLInputElement | null>(null);

  function loadConfig(file: Blob) {
    if (typeof file !== 'undefined') {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        await configManager.load(JSON.parse(event.target?.result as string));
        props.onLoad?.();
      };
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
        title={props.label ?? 'import'}
        iconText='json'
        onClick={() => {
          importConfigElement.current?.click();
        }}
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
