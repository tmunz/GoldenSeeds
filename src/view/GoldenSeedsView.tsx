import React from 'react';

import { Editor } from '../domain/editor/Editor';
import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { svgService } from '../domain/svg/SvgService';
import { RawConfig } from '../domain/config/RawConfig';
import { PngExporter } from '../domain/png/PngExporter';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { configService } from '../domain/config/ConfigService';
import { TextInput } from '../ui/input/TextInput';
import { PreconfigSelector } from '../domain/preconfig/PreconfigSelector';

import './GoldenSeedsView.styl';


type Props = {
  config?: Config;
  preconfigs?: { name: string; rawConfig: RawConfig; svg: string; }[];
  selectedPreconfig?: string;
  editStageId: string | null;
};

interface State {
  width: number;
  height: number;
}

export class GoldenSeedsView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.dimension,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.updateDimension());
    this.updateDimension();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateDimension());
  }

  render() {
    const name = this.props.config?.meta?.name;
    const getExporterData = () => {
      return {
        name: this.props.config?.meta.name ?? 'drawing',
        svg: svgService.generateSvg(this.props.config?.stages, 1000, 1000) ?? '',
        dimensions: { width: 1000, height: 1000 },
      };
    };
    return (
      <div className="golden-seeds-view">
        <ErrorBoundary>
          {this.props.config && (
            <React.Fragment>
              <div
                className="canvas"
                style={{
                  left: this.props.editStageId !== null ? '52vw' : '50vw',
                }}
              >
                <SvgCanvas
                  svgContent={svgService.generateSvg(
                    this.props.config.stages,
                    this.state.width * 1.04, // must be slightly larger, because of movement
                    this.state.height,
                    140,
                  )}
                  config={this.props.config}
                />
              </div>
              <Editor editStageId={this.props.editStageId} config={this.props.config} />
            </React.Fragment>
          )}

          <div className="toolbar">
            <TextInput value={name} onChange={(name: string) => configService.setName(name)} label={'name'} />
            <div className="actions">
              <ConfigImporter />
              <ConfigExporter config={this.props.config} />
              <SvgExporter getData={() => getExporterData()} />
              <PngExporter getData={() => getExporterData()} />
            </div>
            <div className="preconfigs">
              <PreconfigSelector preconfigs={this.props.preconfigs} selectedPreconfig={this.props.selectedPreconfig} />
            </div>
          </div>
          <Themer />
        </ErrorBoundary>
      </div>
    );
  }

  private updateDimension() {
    this.setState(this.dimension);
  }

  private get dimension(): { width: number; height: number } {
    return { width: window.innerWidth, height: window.innerHeight };
  }
}

class ErrorBoundary extends React.Component<React.ComponentProps<any>, { error: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { error: false };
  }

  componentWillReceiveProps() {
    this.setState({ error: false });
  }

  componentDidCatch() {
    this.setState({ error: true });
  }

  render() {
    if (this.state.error) {
      return (
        <React.Fragment>
          <div className="error">
            Something went wrong - this is currently the alpha version of v2.0; work in progress :-(
          </div>
          <a onClick={() => location.reload()}>continue</a>
        </React.Fragment>
      );
    } else {
      return this.props.children;
    }
  }
}
