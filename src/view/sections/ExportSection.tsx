import React from 'react';
import { useTranslation } from '../../i18n/I18n';
import { Config } from '../../domain/config/Config';
import { ConfigExporter } from '../../domain/config/ConfigExporter';
import { Graph } from '../../domain/graph/model/Graph';
import { renderGraphToSvg } from '../../domain/graph/runtime/GraphRenderer';
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
  const { t } = useTranslation();
  const getData = () => ({
    name: props.activeConfig?.meta.name ?? 'drawing',
    svg: props.activeConfig ? renderGraphToSvg(props.graph, 1000, 1000) : '',
    dimensions: { width: 1000, height: 1000 },
  });

  return (
    <Frame
      step="04"
      className="export-column"
      title={t('sections.export')}
      label={t('sections.exportLabel')}
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
