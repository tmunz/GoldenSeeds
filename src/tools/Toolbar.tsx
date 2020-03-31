import React from 'react';

import { SvgExporter } from './SvgExporter';
import { ConfigExporter } from './ConfigExporter';
import { ConfigImporter } from './ConfigImporter';
import { PreconfigSelector } from './PreconfigSelector';
import { Input } from '../ui/input/Input';
import { Config } from '../Config';

import './Toolbar.styl';
import { stageService } from '../stage/StageService';


interface Props {
  config: Config;
  preconfigIndex: number;
  getSvg: () => SVGSVGElement;
}

interface State {
  __removeSvgButtonTest: number;
}

export class Toolbar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { __removeSvgButtonTest: 0 };
  }

  render() {
    const name = this.props.config?.meta?.name;
    // TODO animation // const items = this.props.config.stages[0]?.state?.items?.value;
    return (
      <div className="overlay overlay-container toolbar">
        <Input value={name} onChange={stageService.setName} label={'name'} />
        <PreconfigSelector preconfigIndex={this.props.preconfigIndex} />
        <div className="actions">
          <ConfigImporter onConfigChanged={(rawConfig) => stageService.setRawConfig(rawConfig)} />
          <ConfigExporter config={this.props.config} />
          <SvgExporter name={name} getSvg={() => this.props.getSvg()} />
          {/*<AnimationController target={items} onNewFrame={setItemCount} />*/}
        </div>
      </div>
    );
  }
}
