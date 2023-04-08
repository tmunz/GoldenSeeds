import React from 'react';
import { Config } from '../config/Config';
import { AnimatedButton } from '../../ui/AnimatedButton';

interface Props {
  config?: Config;
}

export class ConfigExporter extends React.Component<Props> {
  private exportConfigElement: HTMLAnchorElement | null = null;

  render() {
    return (
      <div>
        <a target="_blank" ref={(e) => (this.exportConfigElement = e)} onClick={() => this.exportConfig()}>
          <AnimatedButton rotation={AnimatedButton.DIRECTION_DOWN} title="save" iconText="json" />
        </a>
      </div>
    );
  }

  private exportConfig() {
    if (this.props.config) {
      const json = this.convertConfigToJson(this.props.config);
      if (this.exportConfigElement) {
        this.exportConfigElement.download = json.meta.name + '.json';
        this.exportConfigElement.href = URL.createObjectURL(
          new File([JSON.stringify(json, null, 2)], json.meta.name + '.json', {
            type: 'text/json',
          }),
        );
      }
    }
  }

  private convertConfigToJson(config: Config): any {
    const stages = config.stages.map((stage) => {
      const rawState = { type: stage.state.type, data: {} as Record<string, Record<string, string>> };
      Object.keys(stage.state.data).forEach(groupId => {
        rawState.data[groupId] = {};
        Object.keys(stage.state.data[groupId]).forEach(id => {
          rawState.data[groupId][id] = stage.state.data[groupId][id].textValue;
        })
      });
      return rawState;
    });
    return {
      meta: config.meta,
      stages,
    };
  }
}
