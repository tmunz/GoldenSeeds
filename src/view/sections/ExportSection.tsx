import React from 'react';
import { Config } from '../../domain/config/Config';
import { ConfigExporter } from '../../domain/config/ConfigExporter';
import { Graph } from '../../domain/graph/Graph';
import { renderGraphToSvg } from '../../domain/graph/GraphRenderer';
import { PngExporter } from '../../domain/png/PngExporter';
import { SvgExporter } from '../../domain/svg/SvgExporter';
import { Frame } from '../../ui/Frame';
import { SaveNone, SaveRegular, SaveClose } from '../../ui/icon/Save';

import './ExportSection.css';

export function ExportSection(props: {
  activeConfig?: Config;
  graph: Graph;
  open: boolean;
  onToggle: () => void;
}) {
  const getData = () => ({
    name: props.activeConfig?.meta.name ?? 'drawing',
    svg: props.activeConfig ? renderGraphToSvg(props.graph, 1000, 1000) : '',
    dimensions: { width: 1000, height: 1000 },
  });

  return (
    <Frame
      className="export-column"
      title="export"
      label="Export drawing"
      iconPaths={[SaveNone, SaveRegular, SaveClose]}
      open={props.open}
      onToggle={props.onToggle}
    >
      {props.activeConfig && (
        <div className="export-panel">
          <ConfigExporter config={props.activeConfig} />
          <SvgExporter getData={getData} />
          <PngExporter getData={getData} />
        </div>
      )}
    </Frame>
  );
}
