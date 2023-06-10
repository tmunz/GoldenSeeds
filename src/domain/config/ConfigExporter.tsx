import React, { createRef } from 'react';
import { Config } from '../config/Config';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ConfigService } from './ConfigService';
import { SaveNone, SaveRegular, SaveProgress } from '../../ui/icon/Save';

interface Props {
  config?: Config;
}

export class ConfigExporter extends React.Component<Props> {
  private exportConfigElement = createRef<HTMLAnchorElement>();

  render() {
    return (
      <>
        <AnimatedButton
          points={[SaveNone, SaveRegular, SaveProgress]}
          onClick={() => this.exportConfig()}
          title="export"
          iconText="json"
        />
        <a target="_blank" href="#_" ref={this.exportConfigElement} style={{ display: 'none' }}>helper element for download</a>
      </>
    );
  }

  private exportConfig() {
    if (this.props.config) {
      const json = ConfigService.convertConfigToRawConfig(this.props.config);
      if (this.exportConfigElement.current) {
        this.exportConfigElement.current.download = json.meta.name + '.json';
        this.exportConfigElement.current.href = URL.createObjectURL(
          new File([JSON.stringify(json, null, 2)], json.meta.name + '.json', {
            type: 'text/json',
          }),
        );
      }
    }
  }
}
