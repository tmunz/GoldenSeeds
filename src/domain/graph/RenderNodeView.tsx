import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowNode } from './GraphFlowAdapter';
import { portColor } from './PortColors';
import { RENDER_IN_GRID_PORT, RENDER_IN_SVG_PORT, RENDER_IN_BOUNDING_BOX_PORT, RENDER_PREVIEW_PORT } from './RenderNode';
import { SvgCanvas } from '../svg/SvgCanvas';
import { svgService } from '../svg/SvgService';

import './RenderNodeView.styl';

const PREVIEW_SIZE = 240;

const INPUT_PORTS = [
  { id: RENDER_IN_GRID_PORT, type: 'grid' as const },
  { id: RENDER_IN_SVG_PORT, type: 'svg' as const },
  { id: RENDER_IN_BOUNDING_BOX_PORT, type: 'boundingBox' as const },
];

/**
 * Visual representation of the terminal render node (see RenderNode.ts): instead of the generic
 * output handles every other node has, it shows the actual SvgCanvas, populated with whatever
 * grid/svg/boundingBox is currently connected to its three input ports (kept live by GraphCanvas
 * via `data.output`).
 *
 * A node's raw result fields are only an inner fragment (a `<g>`/`<path>` etc.) plus a bounding
 * box - not a standalone document - so they're wrapped into a real, centered/scaled `<svg>` via
 * SvgService.wrapResults before being handed to SvgCanvas, the same way the legacy linear
 * pipeline wraps stage results in SvgService.generateSvg.
 */
export function RenderNodeView({ id, data }: NodeProps<FlowNode>) {
  const preview = data.output?.[RENDER_PREVIEW_PORT];
  const svgContent = preview?.type === 'svgResult'
    ? svgService.wrapResults([preview.value], PREVIEW_SIZE, PREVIEW_SIZE)
    : undefined;

  return (
    <div className="render-node">
      <div className="render-node-header">output</div>
      <div className="render-node-body">
        <div className="render-node-ports render-node-inputs">
          {INPUT_PORTS.map((port) => (
            <div className="render-node-port" key={port.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                style={{ background: portColor(port.type) }}
              />
              <span className="render-node-port-label">{port.id}</span>
            </div>
          ))}
        </div>
        <div className="render-node-preview">
          <SvgCanvas svgKey={id} svgContent={svgContent} />
        </div>
      </div>
    </div>
  );
}


