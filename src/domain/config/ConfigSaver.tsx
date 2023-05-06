import React from 'react';
import { Config } from '../config/Config';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { SaveRegular, SaveNone, SaveProgress } from '../../ui/icon/Save';
import { ConfigService } from './ConfigService';
import { configManager } from './ConfigManager';

interface Props {
  config?: Config;
}

export class ConfigSaver extends React.Component<Props> {

  render() {
    return (
      <div>
        <a target="_blank" onClick={() => this.exportConfig()}>
          <AnimatedButton points={[SaveNone, SaveRegular, SaveProgress]} title="save" iconText="config" />
        </a>
      </div>
    );
  }

  private exportConfig() {
    this.props.config && configManager.save(ConfigService.convertConfigToJson(this.props.config));
  }
}
