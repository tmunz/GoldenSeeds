import React from 'react';

import { Editor } from '../domain/editor/Editor';
import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { svgService } from '../domain/svg/SvgService';
import { ConfigItem, configManager } from '../domain/config/ConfigManager';
import { PngExporter } from '../domain/png/PngExporter';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { ConfigManagerUi } from '../domain/config/ConfigManagerUi';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { configService } from '../domain/config/ConfigService';
import { CarouselSelector } from '../ui/CarouselSelector';
import { TextInput } from '../ui/input/TextInput';
import { AnimatedButton } from '../ui/AnimatedButton';
import { EditorNone, EditorClose, EditorRegular } from '../ui/icon/Editor';

import './GoldenSeedsView.styl';


type Props = {
  configItems: ConfigItem[];
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
            <>
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
              <div className={['sidebar', this.state.editMode ? '' : 'hidden'].join(' ')}>
                <AnimatedButton
                  points={[EditorNone, EditorClose, EditorRegular]}
                  useAsToggle
                  onClick={(active) => this.setState({ editMode: !active })}
                />
                <div className="actions">
                  <ConfigImporter />
                  {this.props.activeConfig &&
                    <>
                      <ConfigExporter config={this.props.activeConfig} />
                      <SvgExporter getData={() => getExporterData()} />
                      <PngExporter getData={() => getExporterData()} />
                    </>
                  }
                </div>
                <div className="actions">
                  {this.props.activeConfig &&
                    <>
                      <TextInput value={name} onChange={(name: string) => configService.setName(name)} label={'name'} />
                      {this.props.configsManageable &&
                        <ConfigManagerUi configItems={this.props.configItems} activeConfig={this.props.activeConfig} />
                      }
                    </>
                  }
                </div>
                <Editor config={this.props.activeConfig} />
              </div>
            </>
          )}

          <div className="preconfig-bar">
            <CarouselSelector
              items={this.props.configItems}
              selected={this.props.activeConfig?.meta.name}
              select={id => configManager.select(id)}
              scale={3}
            />
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
        <>
          <div className="error">
            Something went wrong - this is currently the alpha version of v2.0; work in progress :-(
          </div>
          <a onClick={() => location.reload()}>continue</a>
        </>
      );
    } else {
      return this.props.children;
    }
  }
}
