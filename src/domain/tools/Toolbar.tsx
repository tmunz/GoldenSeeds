import React from 'react';

import { SvgExporter } from '../svg/SvgExporter';
import { ConfigExporter } from '../config/ConfigExporter';
import { ConfigImporter } from '../config/ConfigImporter';
import { PreconfigSelector } from '../config/PreconfigSelector';
import { Config } from '../config/Config';
import { configService } from '../config/ConfigService';
import { PngExporter } from '../png/PngExporter';
import { TextInput } from '../../ui/input/TextInput';

import './Toolbar.styl';


export type ExporterData = {
  svg: string;
  name: string;
  dimensions: { width: number; height: number };
};

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
        <TextInput value={name} onChange={(name: string) => configService.setName(name)} label={'name'} />
        <PreconfigSelector preconfigIndex={this.props.preconfigIndex} />
        <div className="actions">
          <ConfigImporter />
          <ConfigExporter config={this.props.config} />
          <SvgExporter getData={() => this.props.getExporterData()} />
          <PngExporter getData={() => this.props.getExporterData()} />
        </div>
      </div>
    );
  }
}
