import React from "react";

import { SvgExporter } from "./SvgExporter";
import { ConfigExporter } from "./ConfigExporter";
import { ConfigImporter } from "./ConfigImporter";
import { AnimationController } from "./AnimationController";
import { PreconfigSelector } from "./PreconfigSelector";
import { Input } from "../ui/input/Input";
import { setItemCount, setRawConfig, setName } from "../store/Actions";
import { Config } from "../Config";
import { HistoryController } from "./HistoryController";

import './Toolbar.styl';


interface Props {
  config: Config;
  preconfigIndex: number;
  getSvg: () => SVGSVGElement;
}

interface State {
  __removeSvgButtonTest: number
}

export class Toolbar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { __removeSvgButtonTest: 0 };
  }

  render() {
    const name = this.props.config?.meta?.name;
    const items = this.props.config?.grid?.state?.items?.value;
    return (
      <div className="overlay overlay-container toolbar">
        <Input value={name} onChange={setName} label={"name"} />
        <PreconfigSelector preconfigIndex={this.props.preconfigIndex} />
        <div className="actions">
          <HistoryController />
          <ConfigImporter onConfigChanged={setRawConfig} />
          <ConfigExporter config={this.props.config} />
          <SvgExporter name={name} getSvg={() => this.props.getSvg()} />
          <AnimationController target={items} onNewFrame={setItemCount} />
        </div>
      </div>
    );
  }
}
