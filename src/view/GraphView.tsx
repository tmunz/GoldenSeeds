import React from 'react';

import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { ConfigItem } from '../domain/config/ConfigManager';
import { configService } from '../domain/config/ConfigService';
import { TextInput } from '../ui/input/TextInput';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { ConfigManagerUi } from '../domain/config/ConfigManagerUi';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { PngExporter } from '../domain/png/PngExporter';
import { GraphCanvas } from '../domain/graph/GraphCanvas';
import { renderGraphToSvg } from '../domain/graph/GraphRenderer';

import './GraphView.styl';

/**
 * Top-level view built around the node-graph editor (see GraphCanvas). It replaces the
 * previous linear stage Editor: instead of a fixed list of stages with sliders, the drawing
 * is authored as a graph of generator/value nodes feeding a single, always-present, non-deletable
 * render node (see RenderNode.ts) which shows the resulting SVG.
 */
export function GraphView(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
}) {
  const getExporterData = () => ({
    name: props.activeConfig?.meta.name ?? 'drawing',
    svg: props.activeConfig ? renderGraphToSvg(props.activeConfig.graph, 1000, 1000) : '',
    dimensions: { width: 1000, height: 1000 },
  });

  const name = props.activeConfig?.meta?.name;

  return (
    <div className="graph-view">
      {props.activeConfig && (
        <>
          <div className="actions">
            <ConfigImporter />
            <ConfigExporter config={props.activeConfig} />
            <SvgExporter getData={() => getExporterData()} />
            <PngExporter getData={() => getExporterData()} />
            <TextInput value={name} onChange={(n: string) => configService.setName(n)} label={'name'} />
            {props.configsManageable && (
              <ConfigManagerUi configItems={props.configItems} activeConfig={props.activeConfig} />
            )}
          </div>
          <section className="graph-main">
            <GraphCanvas
              key={props.activeConfig.meta.name}
              graph={props.activeConfig.graph}
              layout={props.activeConfig.layout}
              onGraphChange={(graph, layout) => configService.setGraph(graph, layout)}
            />
          </section>
        </>
      )}
      <Themer />
    </div>
  );
}

