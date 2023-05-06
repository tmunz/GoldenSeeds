import React from 'react';

import { Editor } from '../domain/editor/Editor';
import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { svgService } from '../domain/svg/SvgService';
import { RawConfig } from '../domain/config/RawConfig';
import { PngExporter } from '../domain/png/PngExporter';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { ConfigSaver } from '../domain/config/ConfigSaver';
import { ConfigResetter } from '../domain/config/ConfigResetter';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { ConfigSelector } from '../domain/config/ConfigSelector';
import { configService } from '../domain/config/ConfigService';
import { TextInput } from '../ui/input/TextInput';
import { AnimatedButton } from '../ui/AnimatedButton';
import { EditorNone, EditorClose, EditorRegular } from '../ui/icon/Editor';

import './GoldenSeedsView.styl';


type Props = {
  configs: { name: string; rawConfig: RawConfig; svg: string | null; }[];
  configsManageable: boolean;
  activeConfig?: Config;
};

interface State {
  width: number;
  height: number;
  editMode: boolean;
}

export class GoldenSeedsView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.dimension,
      editMode: true,
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
    const name = this.props.activeConfig?.meta?.name;
    const getExporterData = () => {
      return {
        name: this.props.activeConfig?.meta.name ?? 'drawing',
        svg: svgService.generateSvg(this.props.activeConfig?.stages, 1000, 1000) ?? '',
        dimensions: { width: 1000, height: 1000 },
      };
    };
    return (
      <div className="golden-seeds-view">
        <ErrorBoundary>
          {this.props.activeConfig && (
            <React.Fragment>
              <div
                className="canvas"
                style={{
                  left: '48vw', // !this.state.editMode ? '48vw' : '52vw',
                }}
              >
                <SvgCanvas
                  svgContent={svgService.generateSvg(
                    this.props.activeConfig.stages,
                    this.state.width * 1.04, // must be slightly larger, because of movement
                    this.state.height,
                    140,
                  )}
                  config={this.props.activeConfig}
                />
              </div>
              <div className={["sidebar", this.state.editMode ? '' : 'hidden'].join(" ")}>
                <AnimatedButton
                  points={[EditorNone, EditorClose, EditorRegular]}
                  useAsToggle
                  onClick={(active) => this.setState({ editMode: !active })}
                />
                <TextInput value={name} onChange={(name: string) => configService.setName(name)} label={'name'} />
                <div className="actions">
                  {this.props.configsManageable &&
                    <React.Fragment>
                      <ConfigSaver config={this.props.activeConfig} />
                      <ConfigResetter name={this.props.activeConfig.meta.name} />
                      |
                    </React.Fragment>
                  }
                  <ConfigImporter />
                  {this.props.activeConfig &&
                    <React.Fragment>
                      <ConfigExporter config={this.props.activeConfig} />
                      |
                      <SvgExporter getData={() => getExporterData()} />
                      <PngExporter getData={() => getExporterData()} />
                    </React.Fragment>
                  }
                </div>
                <Editor config={this.props.activeConfig} />
              </div>
            </React.Fragment>
          )}

          <div className="preconfig-bar">
            <ConfigSelector configs={this.props.configs} selectedConfig={this.props.activeConfig?.meta.name} />
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
