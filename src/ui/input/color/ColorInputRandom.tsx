import React from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { Color } from '../../../datatypes/Color';
import { RANDOM_GRADIENT } from './color-channel-config/RandomConfig';

import './ColorInputRandom.css';


export function ColorInputRandom(props: {
  color: Color,
  onSelect: (color: Color) => void,
}) {
  const { t } = useTranslation();
  return <div className="color-input-random">
    <input
      style={{
        background: RANDOM_GRADIENT,
        color: props.color.getHsla().l <= 50 ? '#FFF' : '#000'
      }}
      onClick={() => props.onSelect(new Color(props.color).withRandom())}
      type="button"
      value={t('color.modes.random')}
    />
  </div>;

}
