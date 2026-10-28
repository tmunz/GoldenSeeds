import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { configManager, ConfigItem } from './ConfigManager';
import { PlusNone, PlusRegular, PlusRotated } from '../../ui/icon/Plus';
import { ResetNone, ResetRegular, ResetProgress } from '../../ui/icon/Reset';
import { Config } from './Config';
import { toRawConfig } from '../graph/GraphSerializer';
import { LoadNone, LoadProgress, LoadRegular } from '../../ui/icon/Load';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';
import './ConfigManagerUi.css';



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
      configManager.save(toRawConfig(props.activeConfig), sortIndex, configItem?.preconfig ?? false);
    }
  }

  const selected = props.activeConfig?.meta.name;
  const configItem = props.configItems.find(item => item.name === selected);
  return selected ?
    <div className="config-manager">
      {configItem?.preconfig && <AnimatedButton
        points={[ResetNone, ResetRegular, ResetProgress]}
        title="reset"
        onClick={() => configManager.reset(selected)}
      />}
      {configItem && <AnimatedButton
        points={[LoadNone, LoadRegular, LoadProgress]}
        title="reload"
        onClick={() => configManager.select(selected)}
      />}
      <AnimatedButton
        points={[SaveNone, SaveRegular, SaveProgress]}
        title="save"
        onClick={() => save()}
      />
      {configItem && !configItem?.preconfig && <AnimatedButton
        points={[PlusNone, PlusRegular, PlusRotated]}
        rotation={45}
        title="remove"
        onClick={() => remove()}
      />}
    </div> : null;
}
