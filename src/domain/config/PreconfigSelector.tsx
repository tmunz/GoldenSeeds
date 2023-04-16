import React from 'react';

import { preconfigs } from '../../preconfigs/index';
import { configService } from '../config/ConfigService';
import { RangeInput } from '../../ui/input/RangeInput';

interface Props {
  preconfigIndex?: number;
}

export class PreconfigSelector extends React.Component<Props> {
  render() {
    return (
      <RangeInput<number>
        value={this.props.preconfigIndex}
        min={0}
        max={preconfigs.length - 1}
        onChange={(index) => configService.selectPreconfig(index)}
      />
    );
  }
}
