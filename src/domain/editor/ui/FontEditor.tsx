import React, { ReactNode } from 'react';

import { AnimatedButton } from '../../../ui/AnimatedButton';
import { configService } from '../../config/ConfigService';
import { EditorInput } from './EditorInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { StageItemState } from '../../stage/Stage';

export class FontEditor extends EditorInput<number> {

  getEditorInput(name: string, definition: ParamDefinition, state: StageItemState<number>,
    action: (value: string) => void): ReactNode {
    return React.createElement(() => {
      let importConfigElement: HTMLInputElement | null = null;

      function loadConfig(file: Blob) {
        if (typeof file !== 'undefined') {
          const fileReader = new FileReader();
          fileReader.onload = (event) => configService.setRawConfig(JSON.parse(event.target?.result as string));
          fileReader.readAsText(file);
        }
      }

      function openConfig(event: React.ChangeEvent<HTMLInputElement>) {
        const file: Blob | null = (event.target.files ?? [])[0];
        if (file && importConfigElement) {
          loadConfig(file);
          importConfigElement.value = '';
        }
      }

      return (
        <div>
          <div>{name}</div>
          <div>{state.textValue}</div>
          <input
            ref={(e) => (importConfigElement = e)}
            type="file"
            style={{ display: 'none' }}
            onChange={(event) => openConfig(event)}
          />
          <a target="_blank" onClick={() => importConfigElement?.click()}>
            <AnimatedButton rotation={AnimatedButton.DIRECTION_UP} title="load" iconText="font" />
          </a>
        </div>
      );
    });
  }
}
