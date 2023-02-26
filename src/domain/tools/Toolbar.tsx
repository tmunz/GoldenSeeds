import React from 'react';

import { SvgExporter } from './SvgExporter';
import { ConfigExporter } from './ConfigExporter';
import { ConfigImporter } from './ConfigImporter';
import { PreconfigSelector } from './PreconfigSelector';
import { Input } from '../../ui/input/Input';
import { Config } from '../Config';
import { configService } from '../ConfigService';
import { animationService } from '../animation/AnimationService';

import './Toolbar.styl';


interface Props {
  config: Config;
  preconfigIndex: number;
  getSvg: () => SVGSVGElement | null;
}

export class Toolbar extends React.Component<Props> {
  render() {
    const name = this.props.config?.meta?.name;
    return (
      <div className="toolbar">
        <Input value={name} onChange={(name) => configService.setName(name)} label={'name'} />
        <PreconfigSelector preconfigIndex={this.props.preconfigIndex} />
        <div className="actions">
          <ConfigImporter
            onConfigChanged={(rawConfig) => {
              configService.setRawConfig(rawConfig);
            }}
          />
          <ConfigExporter config={this.props.config} />
          <SvgExporter name={name} getSvg={() => this.props.getSvg()} />
        </div>
      </div>
    );
  }
}
