import { BehaviorSubject } from "rxjs";

import { stageRegistry } from ".";
import { Config } from "../Config";
import { preconfigs } from "../preconfigs";

export class StageService {

  preconfigIndex$ = new BehaviorSubject<number>(0);
  config$ = new BehaviorSubject<Config>(this.convertRawToConfig(preconfigs[0]));
  editStageId$ = new BehaviorSubject<number>(null);


  setConfigValue(stageId: number, id: string, rawValue: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages[stageId].state[id] = config.stages[stageId].converter[id].convert(rawValue) as any;
    this.config$.next(nextConfig);
  };

  setRawConfig(configRaw: any, preconfigIndex?: number) {
    this.preconfigIndex$.next(preconfigIndex);
    this.config$.next(this.convertRawToConfig(configRaw));
  };

  selectPreconfig(preconfigIndex: number) {
    this.setRawConfig(preconfigs[preconfigIndex], preconfigIndex);
  };

  setEditMode(stageId: number) {
    this.editStageId$.next(stageId);
  };

  setName(name: string) {
    this.config$.next({ ...this.config$.value, meta: { name } });
  };

  setType(stageId: number, type: string) {
    const stage = stageRegistry.newInstanceOf(type).withState();
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages[stageId] = stage
    this.config$.next(nextConfig);
  };

  private convertRawToConfig(configRaw: any) {
    return {
      meta: configRaw.meta,
      stages: configRaw.stages.map((stage: any) => stageRegistry.newInstanceOf(stage.type)?.withState(stage)),
    }
  }
}

export const stageService = new StageService();
