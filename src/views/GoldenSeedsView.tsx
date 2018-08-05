import * as React from 'react';

import { SvgCanvas } from '../components/SvgCanvas';
import { Input, InputType } from '../components/Input';
import { DirectionSelector, Direction } from '../components/DirectionSelector';
import { DrawConfig, DrawConfigAttribute, DrawConfigType } from '../datatypes/DrawConfig';
import { preconfigs as preconfigsRaw } from '../preconfigs/preconfigs';
import { MathUtils } from '../helper/MathUtils';
import { AnimationHelper } from '../helper/AnimationHelper';
import { DrawConfigInput } from '../components/DrawConfigInput';
import { DrawConfigHelper } from '../helper/DrawConfigHelper';

import './GoldenSeedsView.styl';


interface Props {
}

interface State {
  //SvgCanvas
  config: DrawConfig;
  scale: number;

  //Input
  currentRawConfig: DrawConfig;
  currentPreconfigIndex: number;
  configMode: boolean;
  configHeight: number | "auto";
  animationRunning: boolean;
  isParsableInputs: boolean[],

}

export class GoldenSeedsView extends React.Component<Props, State> {

  static PRECONFIGS: DrawConfig[] = preconfigsRaw.map((c: DrawConfig) => DrawConfig.import(c));
  static INIT_PRECONFIG_INDEX = 0;

  static CONFIG_INPUT_ATTRIBUTES: DrawConfigAttribute[] = [
    DrawConfigAttribute.TYPE, DrawConfigAttribute.ITEMS, DrawConfigAttribute.ITEM_CORNERS,
    DrawConfigAttribute.STYLE, DrawConfigAttribute.BACKGROUND_COLOR, DrawConfigAttribute.ITEM_COLOR,
    DrawConfigAttribute.DISTANCE, DrawConfigAttribute.ANGLE,
    DrawConfigAttribute.ITEM_RATIO, DrawConfigAttribute.ITEM_SIZE, DrawConfigAttribute.ITEM_ANGLE,
    DrawConfigAttribute.CUT_RATIO_0, DrawConfigAttribute.CUT_RATIO_1,
  ];

  overlayConfigContainerElement: HTMLElement;
  importConfigElement: HTMLInputElement;
  exportConfigElement: HTMLAnchorElement;
  exportSvgElement: HTMLAnchorElement;
  svgCanvas: SvgCanvas;

  constructor(props: Props) {
    super(props);

    let currentRawConfig = GoldenSeedsView.PRECONFIGS[GoldenSeedsView.INIT_PRECONFIG_INDEX];
    this.state = {
      currentPreconfigIndex: GoldenSeedsView.INIT_PRECONFIG_INDEX,
      currentRawConfig: currentRawConfig,
      animationRunning: false,
      ...DrawConfigHelper.generateConfigState(currentRawConfig, new DrawConfig(), 1),
      configMode: true,
      configHeight: "auto"
    };
  }

  componentDidMount() {
    this.setState(state => ({ configHeight: state.configMode ? this.overlayConfigContainerElement.scrollHeight : 0 }));
  }

  componentDidUpdate() {
    if (!this.state.configMode && this.state.configHeight !== 0) {
      window.requestAnimationFrame(() => this.setState({ configHeight: 0 }));
    }
  }

  exportConfig = () => {
    this.exportConfigElement.download = this.state.currentRawConfig.name + '.json';
    this.exportConfigElement.href = URL.createObjectURL(new File([
      JSON.stringify(DrawConfig.export(this.state.currentRawConfig))
    ], this.state.currentRawConfig.name + '.json', { type: 'text/json' }));
  }

  exportSvg = () => {
    this.exportSvgElement.download = this.state.currentRawConfig.name + '.svg';
    this.exportSvgElement.href = URL.createObjectURL(new File([
      this.svgCanvas ? this.svgCanvas.svgContent.outerHTML : ''
    ], this.state.currentRawConfig.name + '.svg', { type: 'image/svg+xml' }));
  }

  animate = () => {
    if (!this.state.animationRunning) {
      const interval = 40;
      const start = new Date().getTime();
      const targetItems = this.state.currentRawConfig.items;
      this.setState({ animationRunning: true });
      const animation = setInterval(() => {
        let frame = (new Date().getTime() - start) / interval;
        var n = Math.max(1, Math.min(Math.round(AnimationHelper.easeInOut(0, targetItems, frame, MathUtils.goldenRatio * interval)), targetItems));
        if (n < targetItems && this.state.animationRunning) {
          this.setState({ animationRunning: true, ...DrawConfigHelper.generateConfigState({ ...this.state.currentRawConfig, items: n }, this.state.config, this.state.scale) });
        } else {
          clearInterval(animation);
          this.setState({ animationRunning: false, ...DrawConfigHelper.generateConfigState(this.state.currentRawConfig, this.state.config, this.state.scale) });
        }
      }, interval);
    }
  }

  toggleConfigMode = () => {
    this.setState(state => {
      let nextConfigMode = !state.configMode;
      let configHeight: number = this.overlayConfigContainerElement.scrollHeight;
      if (nextConfigMode) {
        setTimeout(() => this.setState({ configHeight: "auto" }), 500);
      }
      //actually collapsing it in componentDidUpdate
      return { configMode: nextConfigMode, configHeight };
    });
  }

  createDrawConfigInputField(attribute: DrawConfigAttribute) {
    return <DrawConfigInput
      key={attribute}
      attribute={attribute}
      value={DrawConfig.getValue(this.state.currentRawConfig, attribute)}
      isParsable={this.state.isParsableInputs[attribute]}
      onChange={(value: any) => {
        this.setState(state => {
          let currentRawConfig = { ...state.currentRawConfig }
          DrawConfig.setValue(currentRawConfig, attribute, value);
          return { ...state, currentRawConfig, ...DrawConfigHelper.generateConfigState(currentRawConfig, this.state.config, this.state.scale) };
        });
      }}
    />;
  }

  static loadConfig = (file: Blob, onLoad: (config: DrawConfig) => void) => {
    if (typeof file !== 'undefined') {
      var fileReader = new FileReader();
      fileReader.onload = event => {
        let config = DrawConfig.import(JSON.parse(event.target.result));
        onLoad(config);
      }
      fileReader.readAsText(file);
    }
  }

  render() {
    return (
      <div className="golden-seeds-view">
        <div className="canvas" style={{ left: (this.state.configMode ? "52%" : "50%") }}>
          <SvgCanvas
            ref={e => this.svgCanvas = e}
            config={this.state.config}
            scale={this.state.scale}
            width={window.innerWidth * 104}
            height={window.innerHeight}
          />
        </div>
        <div className="overlay overlay-config">
          <div
            className="colapsable"
            style={{
              height: this.state.configHeight
            }}
          >
            <div ref={e => this.overlayConfigContainerElement = e} className="overlay-container">
              <Input
                value={this.state.currentPreconfigIndex}
                onChange={(currentPreconfigIndex) => this.setState({
                  currentPreconfigIndex,
                  currentRawConfig: GoldenSeedsView.PRECONFIGS[currentPreconfigIndex],
                  ...DrawConfigHelper.generateConfigState(GoldenSeedsView.PRECONFIGS[currentPreconfigIndex], this.state.config, this.state.scale)
                })}
                label="preconfig"
                type={InputType.RANGE}
                min={0}
                max={GoldenSeedsView.PRECONFIGS.length - 1}
              />
              {GoldenSeedsView.CONFIG_INPUT_ATTRIBUTES.map(attribute => this.createDrawConfigInputField(attribute))}
            </div>
          </div>
          <DirectionSelector
            className="config-mode-selector"
            size={60}
            direction={this.state.configMode ? Direction.UP : Direction.DOWN}
            onClick={this.toggleConfigMode}
          />
        </div>
        <div className="overlay overlay-export overlay-container">
          {this.createDrawConfigInputField(DrawConfigAttribute.NAME)}
          <div>
            <input
              ref={e => this.importConfigElement = e}
              type="file"
              style={{ display: 'none' }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                let file: Blob = event.target.files[0];
                if (typeof file !== 'undefined') {
                  GoldenSeedsView.loadConfig(file, currentRawConfig =>
                    this.setState({
                      currentRawConfig: currentRawConfig,
                      ...DrawConfigHelper.generateConfigState(currentRawConfig, this.state.config, this.state.scale)
                    }))
                  this.importConfigElement.value = '';
                }
              }
              }
            />
            <a target="_blank" onClick={() => this.importConfigElement.click()}>open config</a>
          </div>
          <div>
            <a target="_blank" ref={e => this.exportConfigElement = e} onClick={this.exportConfig} >save config</a>
          </div>
          <div>
            <a target="_blank" ref={e => this.exportSvgElement = e} onClick={this.exportSvg} >export svg</a>
          </div>
        </div>
        <div className="overlay overlay-animation overlay-container">
          <div>
            <a
              className={this.state.animationRunning ? "active" : ""}
              target="_blank"
              onClick={this.animate}
            >
              {this.state.animationRunning && this.state.config.items} animate
            </a>
          </div>
        </div>
      </div>
    );
  }
}