import React from 'react';

import { preconfigs } from '../preconfigs/index';
import { Input, InputType } from '../ui/input/Input';
import { stageService } from '../stage/StageService';


interface Props {
  preconfigIndex: number;
}

export class PreconfigSelector extends React.Component<Props> {

  render() {
    return (
      <Input
        type={InputType.RANGE}
        rangeValue={this.props.preconfigIndex}
        min={0}
        max={preconfigs.length - 1}
        onChange={(index: number) => stageService.selectPreconfig(index)}
      />
    );
  }
}
