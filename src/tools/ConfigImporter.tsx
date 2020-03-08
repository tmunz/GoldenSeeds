import React from "react";

import { DirectionButton, Direction } from "../ui/DirectionButton";


interface Props {
  onConfigChanged: (configRaw: any) => void;
}

export class ConfigImporter extends React.Component<Props> {

  private importConfigElement: HTMLInputElement;

  render() {
    return (
      <div>
        <input
          ref={e => this.importConfigElement = e}
          type="file"
          style={{ display: 'none' }}
          onChange={event => this.openConfig(event)}
        />
        <a
          target="_blank"
          onClick={() => this.importConfigElement.click()}>
          <DirectionButton direction={Direction.UP} title="load" iconText="json" />
        </a>
      </div>
    );
  }

  private loadConfig(file: Blob, onLoad: (config: any) => void) {
    if (typeof file !== 'undefined') {
      const fileReader = new FileReader();
      fileReader.onload = event => onLoad(JSON.parse(event.target.result as string));
      fileReader.readAsText(file);
    }
  }

  private openConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file: Blob = event.target.files[0];
    if (typeof file !== 'undefined') {
      this.loadConfig(file, this.props.onConfigChanged);
      this.importConfigElement.value = '';
    }
  }
}
