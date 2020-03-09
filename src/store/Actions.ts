import { appStore } from './AppStore';
import { Converter } from '../converter';
import { stageByType } from '../stage';


export const setConfigValue = (stageName: string, name: string, value: any) => {
  const converter: Converter<any> = (appStore.state().config as any)[stageName].converter[name];
  appStore.merge(converter.convert(value), ['config', stageName, 'state', name]);
};

export const setRawConfig = (configRaw: any, preconfigIndex?: number) => {
  appStore.set(preconfigIndex, ['preconfigIndex'], false);
  appStore.set({
    meta: configRaw.meta,
    grid: stageByType('grid', configRaw.grid.type).withState(configRaw.grid),
    background: stageByType('background', configRaw.background.type).withState(configRaw.background),
    drawer: stageByType('drawer', configRaw.drawer.type).withState(configRaw.drawer),
  }, ['config']);
};

export const setConfigFromPreconfigs = (preconfigIndex: number, preconfigs: any[]) => {
  setRawConfig(preconfigs[preconfigIndex], preconfigIndex);
};

export const setEditMode = (stageId: string) => {
  appStore.set(stageId, ['editStageId'], false);
};

export const setName = (name: string) => {
  appStore.set(name, ['config', 'meta', 'name']);
};

export const setItemCount = (count: number) => {
  setConfigValue('grid', 'items', count);
};

export const setType = (stageId: string, type: string) => {
  const stage = stageByType(stageId, type).withState();
  appStore.set(stage, ['config', stageId]);
};
