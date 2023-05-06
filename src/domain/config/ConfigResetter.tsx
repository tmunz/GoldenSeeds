import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ResetRegular, ResetNone, ResetProgress } from '../../ui/icon/Reset';
import { configManager } from './ConfigManager';


interface Props {
  name?: string;
}

export class ConfigResetter extends React.Component<Props> {

  render() {
    return (
      <div>
        <a target="_blank" onClick={() => this.reset()}>
          <AnimatedButton points={[ResetNone, ResetRegular, ResetProgress]} title="reset" iconText="config" />
        </a>
      </div>
    );
  }

  private reset() {
    this.props.name && configManager.reset(this.props.name);
  }
}
