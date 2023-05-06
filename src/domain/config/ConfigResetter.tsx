import React from 'react';
import { AnimatedButton } from '../../ui/AnimatedButton';
import { ResetRegular, ResetNone, ResetProgress } from '../../ui/icon/Reset';
import { preconfigService } from '../preconfig/PreconfigService';

interface Props {
  name?: string;
}

export class ConfigResetter extends React.Component<Props> {

  render() {
    return (
      <div>
        <a target="_blank" onClick={() => this.exportConfig()}>
          <AnimatedButton points={[ResetNone, ResetRegular, ResetProgress]} title="reset" iconText="config" />
        </a>
      </div>
    );
  }

  private exportConfig() {
    this.props.name && preconfigService.reset(name);
  }
}
