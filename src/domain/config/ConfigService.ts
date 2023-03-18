import { BehaviorSubject } from 'rxjs';

import { preconfigs } from '../../preconfigs';

import { Config } from './Config';
import { converterService } from '../converter/ConverterService';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { Stage } from '../stage/Stage';

export class ConfigService {
  preconfigIndex$ = new BehaviorSubject<number>(-1);
  config$ = new BehaviorSubject<Config>({ meta: { name: '' }, stages: [] });

  setConfigValue(stageId: string, id: string, rawValue: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const index = this.findIndexByStageId(stageId);
    nextConfig.stages[index].state[id] = converterService.convert(
      config.stages[index].generator.definition[id].type,
      rawValue,
    ) as any;
    this.config$.next(nextConfig);
  }

  setRawConfig(configRaw: any, preconfigIndex = -1) {
    this.preconfigIndex$.next(preconfigIndex);
    this.config$.next(this.convertRawToConfig(configRaw));
  }

  selectPreconfigByName(name: string | null) {
    const index = preconfigs.findIndex(p => p.meta.name === name);
    this.selectPreconfig(Math.max(0, index));
  }

  selectPreconfig(preconfigIndex: number) {
    this.setRawConfig(preconfigs[preconfigIndex], preconfigIndex);
  }

  setName(name: string) {
    this.config$.next({ ...this.config$.value, meta: { name } });
  }

  setType(stageId: string, type: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages[this.findIndexByStageId(stageId)] = new Stage(
      svgGeneratorRegistry.newInstance(type),
      {},
      stageId,
    );
    this.config$.next(nextConfig);
  }

  deleteStage(stageId: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages.splice(this.findIndexByStageId(stageId), 1);
    this.config$.next(nextConfig);
  }

  swapStages(a: number, b: number): void {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages[a] = nextConfig.stages.splice(b, 1, nextConfig.stages[a])[0];
    this.config$.next(nextConfig);
  }

  addStage(): void {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages.push(new Stage(svgGeneratorRegistry.getDefaultGenerator()));
    this.config$.next(nextConfig);
  }

  setAnimationValue(stageId: string, id?: string, rawValue?: string) {
    typeof id === 'string' && typeof rawValue === 'string' && this.setConfigValue(stageId, id, rawValue);
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const stageIndex = this.findIndexByStageId(stageId);
    nextConfig.stages[stageIndex] = {
      ...nextConfig.stages[stageIndex],
      animatedId: id,
    } as Stage;
    this.config$.next(nextConfig);
  }

  private findIndexByStageId(stageId: string): number {
    return this.config$.value.stages.findIndex((s) => s.id === stageId);
  }

  private convertRawToConfig(configRaw: any) {
    return {
      meta: configRaw.meta,
      stages: configRaw.stages.map(
        (stageRaw: any) => new Stage(svgGeneratorRegistry.newInstance(stageRaw.type), stageRaw),
      ),
    };
  }
}

export const configService = new ConfigService();
