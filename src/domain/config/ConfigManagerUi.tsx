import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { configManager, ConfigItem } from './ConfigManager';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { ResetNone, ResetRegular, ResetProgress } from '../../ui/icon/Reset';
import { Config } from './Config';
import { ConfigService } from './ConfigService';

import './ConfigManagerUi.styl';


interface Props {
  configItems: ConfigItem[];
  activeConfig?: Config;
}

export class ConfigManagerUi extends React.Component<Props> {

  render() {
    const selected = this.props.activeConfig?.meta.name;
    return (
      selected &&
      <div className="config-manager">
        <AnimatedButton
          points={[ResetNone, ResetRegular, ResetProgress]}
          title="reset"
          onClick={() => configManager.reset(selected)}
        />
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_UP}
          title="reload"
          onClick={() => configManager.select(selected)}
        />
        <AnimatedButton
          rotation={AnimatedButton.DIRECTION_DOWN}
          title="save"
          onClick={() => this.save()}
        />
        <AnimatedButton
          points={[PlusNone, PlusRegular, PlusRotated]}
          rotation={45}
          title="remove"
          onClick={() => this.remove()}
        />
      </div>
    );
  }

  private remove() {
    const name = this.props.activeConfig?.meta.name;
    const selectedIndex = this.props.configItems.findIndex(c => c.name === name);
    const nextIndex = (selectedIndex + 1 + this.props.configItems.length) % this.props.configItems.length;
    const nextName = selectedIndex !== nextIndex ? this.props.configItems[nextIndex]?.name : undefined;
    configManager.select(nextName);
    console.log(nextName);
    if (name) {
      configManager.delete(name);
    }
  }

  private save() {
    const configItem = this.props.configItems.find(c => c.name === this.props.activeConfig?.meta.name);
    const sortIndex = configItem?.sortIndex ?? (this.props.configItems[this.props.configItems.length - 1].sortIndex + 1);
    if (this.props.activeConfig) {
      configManager.save(ConfigService.convertConfigToRawConfig(this.props.activeConfig), sortIndex);
    }
  }
}
