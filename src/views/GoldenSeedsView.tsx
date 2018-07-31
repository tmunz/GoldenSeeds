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
  animationRunning: boolean;
  isParsableInputs: boolean[],
}

export class GoldenSeedsView extends React.Component<Props, State> {

  static PRECONFIGS: DrawConfig[] = preconfigsRaw.map(c => DrawConfig.produce(c));
  static INIT_PRECONFIG_INDEX = 0;

  static CONFIG_INPUT_ATTRIBUTES: DrawConfigAttribute[] = [
    DrawConfigAttribute.ITEMS, DrawConfigAttribute.BACKGROUND_COLOR, DrawConfigAttribute.ANGLE, 
    DrawConfigAttribute.DISTANCE,
    DrawConfigAttribute.TYPE, DrawConfigAttribute.ITEM_CORNERS, DrawConfigAttribute.ITEM_COLOR,
    DrawConfigAttribute.ITEM_ANGLE, DrawConfigAttribute.ITEM_SIZE, DrawConfigAttribute.ITEM_RATIO,
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
    };
  }

  componentDidMount() {
    this.forceUpdate();
  }

  exportConfig = () => {
    this.exportConfigElement.download = this.state.currentRawConfig.name + '.json';
    this.exportConfigElement.href = URL.createObjectURL(new File([
      JSON.stringify(this.state.currentRawConfig)
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

  static loadConfig = (selection: any, onLoad: (config: DrawConfig) => void) => {
    if (typeof selection.files[0] !== 'undefined') {
      var fileReader = new FileReader();
      fileReader.onload = event => {
        onLoad(DrawConfig.produce(JSON.parse(event.target.result)));
      }
      fileReader.readAsText(selection.files[0]);
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
              height: this.state.configMode ?
                (this.overlayConfigContainerElement ? this.overlayConfigContainerElement.scrollHeight : "auto")
                : 0
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
            onClick={() => this.setState(state => ({ configMode: !state.configMode }))}
          />
        </div>
        <div className="overlay overlay-export overlay-container">
          {this.createDrawConfigInputField(DrawConfigAttribute.NAME)}
          <div>
            <input
              ref={e => this.importConfigElement = e}
              type="file"
              style={{ display: 'none' }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                GoldenSeedsView.loadConfig(event.target, currentRawConfig =>
                  this.setState(DrawConfigHelper.generateConfigState(currentRawConfig, this.state.config, this.state.scale)))
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