import React from 'react';
import { Config } from '../config/Config';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ConfigService } from './ConfigService';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';

interface Props {
  config?: Config;
}

export class ConfigExporter extends React.Component<Props> {
  private exportConfigElement: HTMLAnchorElement | null = null;

  render() {
    return (
      <div>
        <a target="_blank" ref={(e) => (this.exportConfigElement = e)} onClick={() => this.exportConfig()}>
          <AnimatedButton  points={[SaveNone, SaveRegular, SaveProgress]} title="export" iconText="json" />
        </a>
      </div>
    );
  }

  private exportConfig() {
    if (this.props.config) {
      const json = ConfigService.convertConfigToJson(this.props.config);
      if (this.exportConfigElement) {
        this.exportConfigElement.download = json.meta.name + '.json';
        this.exportConfigElement.href = URL.createObjectURL(
          new File([JSON.stringify(json, null, 2)], json.meta.name + '.json', {
            type: 'text/json',
          }),
        );
      }
    }
  }
}
