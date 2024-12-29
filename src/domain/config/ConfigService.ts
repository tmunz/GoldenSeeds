import { BehaviorSubject } from 'rxjs';

import { Config } from './Config';
import { svgGeneratorRegistry } from '../generator/SvgGeneratorRegistry';
import { Stage } from './Stage';
import { SvgGenerator } from '../generator/SvgGenerator';
import { RawConfig, RawConfigStage } from './RawConfig';

export class ConfigService {
  config$ = new BehaviorSubject<Config>({ meta: { name: '' }, stages: [] });

  async setConfigValue(stageId: string, groupId: string, id: string, value: any) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const index = this.findIndexByStageId(stageId);
    if (config.stages[index]?.generator) {
      nextConfig.stages[index].state.data[groupId][id].setValue(value);
      this.config$.next(nextConfig);
    }
  }

  async setStageName(stageId: string, name: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const index = this.findIndexByStageId(stageId);
    if (config.stages[index]?.generator) {
      nextConfig.stages[index].name = name;
      this.config$.next(nextConfig);
    }
  }

  async setRawConfig(rawConfig: RawConfig): Promise<void> {
    this.config$.next(await ConfigService.convert(rawConfig));
  }

  setName(name: string) {
    this.config$.next({ ...this.config$.value, meta: { name } });
  }

  async setType(stageId: string, type: string) {
    const config = this.config$.value;
    const nextConfig = { ...config, stages: [...config.stages] };
    const currentStageName = nextConfig.stages[this.findIndexByStageId(stageId)].name;
    nextConfig.stages[this.findIndexByStageId(stageId)] =  await ConfigService.createStage(
      svgGeneratorRegistry.newInstance(type),
      {id: stageId, name: currentStageName, type, data: {}},
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
    nextConfig.stages.push(await ConfigService.createStage(svgGeneratorRegistry.getDefaultGenerator()));
    this.config$.next(nextConfig);
  }

  setAnimationValue(stageId: string, groupId: string, id: string, textValue: string) {
    this.setConfigValue(stageId, groupId, id, textValue);
  }

  private findIndexByStageId(stageId: string): number {
    return this.config$.value.stages.findIndex((s) => s.id === stageId);
  }

  static async convert(rawConfig: RawConfig): Promise<Config> {
    return {
      meta: rawConfig.meta,
      stages: await Promise.all(
        rawConfig.stages.map((stageRaw: RawConfigStage) =>
          ConfigService.createStage(svgGeneratorRegistry.newInstance(stageRaw.type), stageRaw),
        ),
      ),
    };
  }

  private static async createStage(
    generator: SvgGenerator<unknown> | null,
    rawState?: RawConfigStage,
  ): Promise<Stage> {
    return await new Stage(rawState?.id, rawState?.name).with(generator, rawState?.data);
  }

  static convertConfigToRawConfig(config: Config): RawConfig {
    const stages = config.stages.map((stage) => {
      const rawState = { id: stage.id, name: stage.name, type: stage.state.type, data: {} as Record<string, Record<string, string>>};
      Object.keys(stage.state.data).forEach((groupId) => {
        rawState.data[groupId] = {};
        Object.keys(stage.state.data[groupId]).forEach((id) => {
          rawState.data[groupId][id] = `${stage.state.data[groupId][id].getTextValue()}`;
        });
      });
      return rawState;
    });
    return {
      meta: config.meta,
      stages,
    };
  }
}

export const configService = new ConfigService();
