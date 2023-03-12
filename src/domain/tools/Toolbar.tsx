import React from 'react';

import { SvgExporter } from '../svg/SvgExporter';
import { ConfigExporter } from '../config/ConfigExporter';
import { ConfigImporter } from '../config/ConfigImporter';
import { PreconfigSelector } from '../config/PreconfigSelector';
import { Input } from '../../ui/input/Input';
import { Config } from '../config/Config';
import { configService } from '../config/ConfigService';
import { PngExporter } from '../png/PngExporter';

import './Toolbar.styl';


export type ExporterData =  { svg: string, name: string, dimensions: { width: number, height: number } };

interface Props {
  config?: Config;
  preconfigIndex?: number;
  getExporterData: () => ExporterData;
}

export class Toolbar extends React.Component<Props> {
  render() {
    const name = this.props.config?.meta?.name;
    return (
      <div className="toolbar">
        <Input
          value={name}
          onChange={(name) => configService.setName(name)}
          label={'name'}
        />
        <PreconfigSelector preconfigIndex={this.props.preconfigIndex} />
        <div className="actions">
          <ConfigImporter
            onConfigChanged={(rawConfig) => {
              configService.setRawConfig(rawConfig);
            }}
          />
          <ConfigExporter config={this.props.config} />
          <SvgExporter getData={() => this.props.getExporterData()} />
          <PngExporter getData={() => this.props.getExporterData()} />
        </div>
      </div>
    );
  }
}
