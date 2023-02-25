import React from 'react';
import { Config } from '../Config';
import { AnimatedButton } from '../../ui/AnimatedButton';

interface Props {
  config: Config;
}

export class ConfigExporter extends React.Component<Props> {
  private exportConfigElement: HTMLAnchorElement | null = null;

  render() {
    return (
      <div>
        <a
          target="_blank"
          ref={(e) => (this.exportConfigElement = e)}
          onClick={() => this.exportConfig()}
        >
          <AnimatedButton
            rotation={AnimatedButton.DIRECTION_DOWN}
            title="save"
            iconText="json"
          />
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
    const stages = config.stages.map((stage) =>
      Object.keys(stage.state).reduce(
        (agg, key) => ({ ...agg, [key]: stage.state[key].rawValue }),
        { type: stage.generator.type },
      ),
    );
    return {
      meta: config.meta,
      stages,
    };
  }
}
