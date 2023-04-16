import { BehaviorSubject } from 'rxjs';

import { preconfigs } from '../../preconfigs';

import { Config } from './Config';
import { converterService } from '../converter/ConverterService';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { Stage, StageRawState } from './Stage';
import { SvgGenerator } from '../generator/SvgGenerator';

export class ConfigService {
  preconfigIndex$ = new BehaviorSubject<number>(-1);
  config$ = new BehaviorSubject<Config>({ meta: { name: '' }, stages: [] });

  async setConfigValue(stageId: string, groupId: string, id: string, textValue: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const index = this.findIndexByStageId(stageId);
    if (config.stages[index]?.generator) {
      const nextStageItemState = await converterService.convertTextToValue(
        config.stages[index].generator.definition[groupId][id].type,
        textValue,
      );
      const stageItemState = nextConfig.stages[index].state.data[groupId][id];
      nextConfig.stages[index].state.data[groupId][id] = { ...stageItemState, ...nextStageItemState };
      this.config$.next(nextConfig);
    }
  }

  async setRawConfig(configRaw: any, preconfigIndex = -1) {
    this.preconfigIndex$.next(preconfigIndex);
    this.config$.next({
      meta: configRaw.meta,
      stages: await Promise.all(
        configRaw.stages.map((stageRaw: any) =>
          this.createStage(svgGeneratorRegistry.newInstance(stageRaw.type), stageRaw),
        ),
      ),
    });
  }

  selectPreconfigByName(name: string | null) {
    const index = preconfigs.findIndex((p) => p.meta.name === name);
    this.selectPreconfig(Math.max(0, index));
  }

  selectPreconfig(preconfigIndex: number) {
    this.setRawConfig(preconfigs[preconfigIndex], preconfigIndex);
  }

  setName(name: string) {
    this.config$.next({ ...this.config$.value, meta: { name } });
  }

  async setType(stageId: string, type: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages[this.findIndexByStageId(stageId)] = await this.createStage(
      svgGeneratorRegistry.newInstance(type),
      undefined,
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

  moveToIndex(stageId: string, newIndex: number) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const currentIndex = this.findIndexByStageId(stageId);
    nextConfig.stages.splice(newIndex, 0, nextConfig.stages.splice(currentIndex, 1)[0]);
    this.config$.next(nextConfig);
  }

  async addStage(): Promise<void> {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    nextConfig.stages.push(await this.createStage(svgGeneratorRegistry.getDefaultGenerator()));
    this.config$.next(nextConfig);
  }

  setAnimationValue(stageId: string, groupId: string, id: string, textValue: string) {
    this.setConfigValue(stageId, groupId, id, textValue);
  }

  private findIndexByStageId(stageId: string): number {
    return this.config$.value.stages.findIndex((s) => s.id === stageId);
  }

  private async createStage(
    generator: SvgGenerator | null,
    rawState?: StageRawState,
    stageId?: string,
  ): Promise<Stage> {
    return new Stage(generator, rawState, stageId).convertTextToValues();
  }
}

export const configService = new ConfigService();
