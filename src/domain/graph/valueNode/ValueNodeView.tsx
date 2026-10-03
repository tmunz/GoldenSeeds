import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowNode } from '../GraphFlowAdapter';
import { portColor } from '../PortColors';
import { ValueNodeConfig } from '../ValueNodeRegistry';
import { ColorState } from '../../config/stageItemState/ColorState';
import { NumberState } from '../../config/stageItemState/NumberState';
import { ExpressionState } from '../../config/stageItemState/ExpressionState';
import { StringState } from '../../config/stageItemState/StringState';
import { FontState } from '../../config/stageItemState/FontState';
import { ParamDefinition, ParamDefinitionMinMaxStep, ParamDefinitionSelection } from '../../generator/SvgGenerator';
import {
  ColorValueEditor,
  NumberValueEditor,
  ExpressionValueEditor,
  StringValueEditor,
  SelectionValueEditor,
  FontValueEditor,
} from './ValueEditors';

import './ValueNodeView.styl';

function renderEditor(kind: string, state: ValueNodeConfig['state'], definition: ParamDefinition | undefined, onCommit: () => void) {
  switch (kind) {
  case 'value:color':
    return <ColorValueEditor state={state as ColorState} onCommit={onCommit} />;
  case 'value:number':
    return <NumberValueEditor state={state as NumberState} definition={definition as ParamDefinitionMinMaxStep} onCommit={onCommit} />;
  case 'value:expression':
    return <ExpressionValueEditor state={state as ExpressionState} definition={definition as ParamDefinitionMinMaxStep} onCommit={onCommit} />;
  case 'value:string':
    return <StringValueEditor state={state as StringState} onCommit={onCommit} />;
  case 'value:selection':
    return <SelectionValueEditor state={state as StringState} definition={definition as ParamDefinitionSelection} onCommit={onCommit} />;
  case 'value:font':
    return <FontValueEditor state={state as FontState} onCommit={onCommit} />;
  default:
    return null;
  }
}

/**
 * Visual representation of a literal value node (see ValueNodeRegistry): instead of the generic
 * ports-only body every other node has, it shows the actual editor for its held value - reusing
 * the same input components the old per-stage parameter editors (ColorEditor, NumberEditor, ...)
 * used, directly on the node, since generator parameters are now fed exclusively by these
 * connectable value nodes instead of by an inline literal stored on the generator itself.
 */
export function ValueNodeView({ id, data }: NodeProps<FlowNode>) {
  const { graphNode } = data;
  const { state } = graphNode.config as ValueNodeConfig;
  const outputPort = graphNode.outputs[0];

  function commit() {
    data.onValueChange?.(id);
  }

  return (
    <div className="value-node">
      <div className="value-node-header">{graphNode.kind.slice('value:'.length)}</div>
      <div className="value-node-body">
        {renderEditor(graphNode.kind, state, data.definition, commit)}
      </div>
      {outputPort && (
        <div className="value-node-port">
          <Handle
            type="source"
            position={Position.Right}
            id={outputPort.id}
            style={{ background: portColor(outputPort.type) }}
          />
        </div>
      )}
    </div>
  );
}
