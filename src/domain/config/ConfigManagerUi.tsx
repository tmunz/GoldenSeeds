import React from 'react';
import { AnimatedButton, DIRECTION_UP, DIRECTION_DOWN } from '../../ui/AnimatedButton';
import { configManager, ConfigItem } from './ConfigManager';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { ResetNone, ResetRegular, ResetProgress } from '../../ui/icon/Reset';
import { Config } from './Config';
import { ConfigService } from './ConfigService';

import './ConfigManagerUi.styl';


export function ConfigManagerUi(props: {
  configItems: ConfigItem[];
  activeConfig?: Config;
}) {

  function remove() {
    const name = props.activeConfig?.meta.name;
    const selectedIndex = props.configItems.findIndex(c => c.name === name);
    const nextIndex = (selectedIndex + 1 + props.configItems.length) % props.configItems.length;
    const nextName = selectedIndex !== nextIndex ? props.configItems[nextIndex]?.name : undefined;
    configManager.select(nextName);
    if (name) {
      configManager.delete(name);
    }
  }

  function save() {
    const configItem = props.configItems.find(c => c.name === props.activeConfig?.meta.name);
    const sortIndex = configItem?.sortIndex ?? ((props.configItems[props.configItems.length - 1]?.sortIndex ?? 0) + 1);
    if (props.activeConfig) {
      configManager.save(ConfigService.convertConfigToRawConfig(props.activeConfig), sortIndex);
    }
  }

  function getConfigItem(name: string) {
    return props.configItems.find(c => c.name === name);
  }

  const selected = props.activeConfig?.meta.name;
  return selected ?
    <div className="config-manager">
      {getConfigItem(selected)?.preconfig && <AnimatedButton
        points={[ResetNone, ResetRegular, ResetProgress]}
        title="reset"
        onClick={() => configManager.reset(selected)}
      />}
      <AnimatedButton
        rotation={DIRECTION_UP}
        title="reload"
        onClick={() => configManager.select(selected)}
      />
      <AnimatedButton
        rotation={DIRECTION_DOWN}
        title="save"
        onClick={() => save()}
      />
      {!getConfigItem(selected)?.preconfig && <AnimatedButton
        points={[PlusNone, PlusRegular, PlusRotated]}
        rotation={45}
        title="remove"
        onClick={() => remove()}
      />}
    </div> : null;
}
