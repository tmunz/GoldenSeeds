import React, { useDeferredValue, useMemo, useRef } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { Config } from '../../domain/config/Config';
import { Graph } from '../../domain/graph/model/Graph';
import { renderGraphToSvg } from '../../domain/graph/runtime/GraphRenderer';
import { SvgPreview } from '../../domain/svg/SvgPreview';
import { Frame } from '../../ui/Frame';
import { ViewerNone, ViewerRegular, ViewerClose } from '../../ui/icon/Viewer';
import { useDimension } from '../../utils/useDimension';

import './ViewerSection.css';

export function ViewerSection(props: {
  activeConfig?: Config;
  graph: Graph;
  /** Animation frames arrive continuously; deferring them would starve the preview until playback ends. */
  animating?: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const viewerContentRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimension(viewerContentRef);
  // Rendering can be slow; let edits stay responsive and update the preview when there is time.
  const deferredGraph = useDeferredValue(props.graph);
  const graph = props.animating ? props.graph : deferredGraph;
  const preview = useMemo(() => props.activeConfig
    ? renderGraphToSvg(graph, (dimensions?.width ?? 100) * 0.8, (dimensions?.height ?? 100) * 0.8)
    : '', [props.activeConfig, graph, dimensions?.width, dimensions?.height]);
  const name = props.activeConfig?.meta.name;

  return (
    <Frame
      step="03"
      className="viewer-column"
      title={t('sections.view')}
      label={t('sections.viewLabel')}
      iconPaths={[ViewerNone, ViewerRegular, ViewerClose]}
      open={props.open}
      onToggle={props.onToggle}
    >
      <div className="viewer-content" ref={viewerContentRef}>
        {props.activeConfig && <SvgPreview svgKey={name ?? 'drawing'} svgContent={preview} />}
      </div>
    </Frame>
  );
}
