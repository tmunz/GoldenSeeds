import React from 'react';
import { Config } from '../Config';
import { DirectionButton, Direction } from '../ui/DirectionButton';

interface Props {
  config: Config;
}

export class ConfigExporter extends React.Component<Props> {
  private exportConfigElement: HTMLAnchorElement;

  render() {
    return (
      <div>
        <a
          target="_blank"
          ref={e => this.exportConfigElement = e}
          onClick={() => this.exportConfig()} >
          <DirectionButton direction={Direction.DOWN} title="save" iconText="json" />
        </a>
      </div>
    );
  }

  private exportConfig() {
    if (this.props.config) {
      const json = this.convertConfigToJson(this.props.config);
      this.exportConfigElement.download = json.meta.name + '.json';
      this.exportConfigElement.href = URL.createObjectURL(new File([
        JSON.stringify(json, null, 2)
      ], json.meta.name + '.json', { type: 'text/json' }));
    }
  }

  private convertConfigToJson(config: Config): { [key: string]: { [key: string]: string } } {
    return ['grid', 'background', 'drawer'].reduce((stage, stageId) => ({
      ...stage,
      [stageId]: Object.keys((config as any)[stageId].state).reduce(
        (agg, key) => ({ ...agg, [key]: (config as any)[stageId].state[key].rawValue }),
        { type: (config as any)[stageId].type }
      ),
    }), {
      meta: config.meta,
    });
  }
}
