import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { NumberAnimationControls } from '../../animation/NumberAnimationControls';
import { Color } from '../../../datatypes/Color';
import { ColorInput } from '../../../ui/input/color/ColorInput';
import { ExtendedRangeInput } from '../../../ui/input/ExtendedRangeInput';
import { TextInput } from '../../../ui/input/TextInput';
import { TextAreaInput } from '../../../ui/input/TextAreaInput';
import { ParamDefinition } from '../../generator/SvgGenerator';
import { parseParameter } from '../../parameter/ParseParameter';

import './ParameterEditor.css';

/** A stored value can already be unusable (e.g. a broken formula in an imported drawing); flag it right away. */
function isUsable(definition: ParamDefinition, text: string): boolean {
  return definition.type === 'font' || parseParameter(definition, text) !== undefined;
}

/** Draft text stays local until the owner accepts an immutable update. */
export function ParameterEditor({ label, value, definition, onChange, portId, showAnimation = false }: {
  portId?: string;
  showAnimation?: boolean;
  label: string;
  value: string;
  definition: ParamDefinition;
  onChange: (text: string) => boolean;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  const [valid, setValid] = useState(() => isUsable(definition, value));
  useEffect(() => { setText(value); setValid(isUsable(definition, value)); }, [value, definition]);
  const color = useMemo(() => definition.type === 'color' ? new Color(value) : null, [definition.type, value]);
  function change(next: string) {
    setText(next);
    setValid(onChange(next));
  }
  let editor: React.ReactNode;
  switch (definition.type) {
  case 'points':
    editor = <TextAreaInput label={label} value={text} onChange={change}
      className={valid ? '' : 'invalid'} description={t('points.help')} placeholder="[1,1], [2,2], [3,5.6]" />;
    break;
  case 'number':
  case 'expression':
    editor = <ExtendedRangeInput label={label} value={text} min={definition.min} max={definition.max} step={definition.step}
      description={definition.type === 'expression' ? t('expression.help') : undefined}
      className={valid ? '' : 'invalid range-invalid'} onChange={change} />;
    break;
  case 'selection': {
    const option = definition.options[Number(text)];
    editor = <ExtendedRangeInput label={label} value={text}
      valueText={`${text}: ${t(`options.${option}`, {}, option ?? t('options.invalid'))}`}
      min={0} max={Math.max(0, definition.options.length - 1)} step={1}
      className={valid ? '' : 'invalid range-invalid'} onChange={change} />;
    break;
  }
  case 'string':
    editor = <TextInput label={label} value={text} onChange={change} />;
    break;
  case 'color':
    editor = <ColorInput label={label} value={color} onChange={(next) => change(next.getAcn())} />;
    break;
  default: return null;
  }
  return <div className="parameter-editor nodrag nowheel">
    {editor}
    {showAnimation && definition.type === 'number' && <NumberAnimationControls value={value} definition={definition} portId={portId} valid={valid} />}
  </div>;
}
