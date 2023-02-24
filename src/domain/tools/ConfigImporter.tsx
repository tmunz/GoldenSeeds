import React from 'react';

import { AnimatedButton } from '../../ui/AnimatedButton';

interface Props {
  onConfigChanged: (configRaw: any) => void;
}

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
          <AnimatedButton
            rotation={AnimatedButton.DIRECTION_DOWN}
            title="load"
            iconText="json"
          />
        </a>
      </div>
    );
  }

  private loadConfig(file: Blob, onLoad: (config: any) => void) {
    if (typeof file !== 'undefined') {
      const fileReader = new FileReader();
      fileReader.onload = (event) =>
        onLoad(JSON.parse(event.target?.result as string));
      fileReader.readAsText(file);
    }
  }

  private openConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob | null = (event.target.files ?? [])[0];
    if (file && this.importConfigElement) {
      this.loadConfig(file, this.props.onConfigChanged);
      this.importConfigElement.value = '';
    }
  }
}
