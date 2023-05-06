import React from 'react';

import { AnimatedButton } from '../../ui/AnimatedButton';
import { configService } from './ConfigService';
import { LoadProgress, LoadRegular, LoadNone } from '../../ui/icon/Load';

interface Props {}

export class ConfigImporter extends React.Component<Props> {
  private importConfigElement: HTMLInputElement | null = null;

  render() {
    return (
      <div>
        <input
          ref={(e) => (this.importConfigElement = e)}
          type="file"
          style={{ display: 'none' }}
          onChange={(event) => this.openConfig(event)}
        />
        <a target="_blank" onClick={() => this.importConfigElement?.click()}>
          <AnimatedButton points={[LoadNone, LoadRegular, LoadProgress]} title="import" iconText="json" />
        </a>
      </div>
    );
  }

  private loadConfig(file: Blob) {
    if (typeof file !== 'undefined') {
      const fileReader = new FileReader();
      fileReader.onload = (event) => configService.setRawConfig(JSON.parse(event.target?.result as string));
      fileReader.readAsText(file);
    }
  }

  private openConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob | null = (event.target.files ?? [])[0];
    if (file && this.importConfigElement) {
      this.loadConfig(file);
      this.importConfigElement.value = '';
    }
  }
}
