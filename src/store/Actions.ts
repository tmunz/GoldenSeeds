import { appStore } from './AppStore';
import { Converter } from '../converter';
import { stageRegistry } from '../stage';


export const setConfigValue = (stageId: number, name: string, value: any) => {
  const converter: Converter<any> = appStore.state().config.stages[stageId].converter[name];
  appStore.merge(converter.convert(value), ['config', 'stages', stageId, 'state', name]);
};

export const setRawConfig = (configRaw: any, preconfigIndex?: number) => {
  appStore.set(preconfigIndex, ['preconfigIndex'], false);
  appStore.set({
    meta: configRaw.meta,
    stages: configRaw.stages.map((stage: any) => stageRegistry.newInstanceOf(stage.type)?.withState(stage)),
  }, ['config']);
};

export const setConfigFromPreconfigs = (preconfigIndex: number, preconfigs: any[]) => {
  setRawConfig(preconfigs[preconfigIndex], preconfigIndex);
};

export const setEditMode = (stageId: number) => {
  appStore.set(stageId, ['editStageId'], false);
};

export const setName = (name: string) => {
  appStore.set(name, ['config', 'meta', 'name']);
};

export const setItemCount = (count: number) => {
  setConfigValue(0, 'items', count);
};

export const setType = (stageId: number, type: string) => {
  const stage = stageRegistry.newInstanceOf(type).withState();
  appStore.set(stage, ['config', stageId]);
};
