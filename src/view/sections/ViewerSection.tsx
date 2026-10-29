import React, { useMemo, useRef } from 'react';
import { Config } from '../../domain/config/Config';
import { configService } from '../../domain/config/ConfigService';
import { Graph } from '../../domain/graph/Graph';
import { renderGraphToSvg } from '../../domain/graph/GraphRenderer';
import { SvgCanvas } from '../../domain/svg/SvgCanvas';
import { Frame } from '../../ui/Frame';
import { ViewerNone, ViewerRegular, ViewerClose } from '../../ui/icon/Viewer';
import { TextInput } from '../../ui/input/TextInput';
import { useDimension } from '../../utils/useDimension';

import './ViewerSection.css';

export function ViewerSection(props: {
  activeConfig?: Config;
  graph: Graph;
  open: boolean;
  onToggle: () => void;
}) {
  const viewerContentRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimension(viewerContentRef);
  const preview = useMemo(() => props.activeConfig
    ? renderGraphToSvg(props.graph, (dimensions?.width ?? 100) * 0.8, (dimensions?.height ?? 100) * 0.8)
    : '', [props.activeConfig, props.graph, dimensions?.width, dimensions?.height]);
  const name = props.activeConfig?.meta.name;

  return (
    <Frame
      className="viewer-column"
      title="view"
      label="Drawing preview"
      iconPaths={[ViewerNone, ViewerRegular, ViewerClose]}
      open={props.open}
      onToggle={props.onToggle}
    >
      <header className="viewer-header">
        {props.activeConfig && (
          <TextInput value={name} onChange={(n: string) => configService.setName(n)} label="name" />
        )}
      </header>
      <div className="viewer-content" ref={viewerContentRef}>
        {props.activeConfig && <SvgCanvas svgKey={name ?? 'drawing'} svgContent={preview} />}
      </div>
    </Frame>
  );
}
