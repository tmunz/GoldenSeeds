import { BehaviorSubject } from 'rxjs';

import { preconfigs } from '../preconfigs';

import { Config } from './Config';
import { converterService } from './converter/ConverterService';
import { svgGeneratorRegistry } from './generator/SvgGeneratorRegistry';
import { Stage } from './stage/Stage';

export class ConfigService {

  preconfigIndex$ = new BehaviorSubject<number>(0);
  config$ = new BehaviorSubject<Config>(this.convertRawToConfig(preconfigs[0]));

  setConfigValue(stageId: number, id: string, rawValue: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages[stageId].state[id] = converterService.convert(
      config.stages[stageId].generator.definition[id].type,
      rawValue,
    ) as any;
    this.config$.next(nextConfig);
  }

  setRawConfig(configRaw: any, preconfigIndex: number = 0) {
    this.preconfigIndex$.next(preconfigIndex);
    this.config$.next(this.convertRawToConfig(configRaw));
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
      svgGeneratorRegistry.newInstance(type), {}, stageId,
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

  private findIndexByStageId(stageId: string): number {
    return this.config$.value.stages.findIndex(s => s.id === stageId);
  }

  private convertRawToConfig(configRaw: any) {
    return {
      meta: configRaw.meta,
      stages: configRaw.stages.map(
        (stageRaw: any) =>
          new Stage(svgGeneratorRegistry.newInstance(stageRaw.type), stageRaw),
      ),
    };
  }
}

export const configService = new ConfigService();
