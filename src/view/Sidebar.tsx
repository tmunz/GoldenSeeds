import React from "react"
import { Editor } from '../domain/editor/Editor';
import { PngExporter } from '../domain/png/PngExporter';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { ConfigManagerUi } from '../domain/config/ConfigManagerUi';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { configService } from '../domain/config/ConfigService';
import { TextInput } from '../ui/input/TextInput';
import { svgService } from "../domain/svg/SvgService";

import './Sidebar.styl';

export interface SidebarProps {
  activeConfig: any;
  configItems: any;
  configsManageable: any;
}

export function Sidebar(props: SidebarProps) {

  const getExporterData = () => {
    return {
      name: props.activeConfig?.meta.name ?? 'drawing',
      svg: svgService.generateSvg(props.activeConfig?.stages, 1000, 1000) ?? '',
      dimensions: { width: 1000, height: 1000 },
    };
  };

  const name = props.activeConfig?.meta?.name;

  return <div className="sidebar">
    <div className="actions">
      <ConfigImporter />
      {props.activeConfig &&
        <>
          <ConfigExporter config={props.activeConfig} />
          <SvgExporter getData={() => getExporterData()} />
          <PngExporter getData={() => getExporterData()} />
        </>
      }
    </div>
    <div className="actions">
      {props.activeConfig &&
        <>
          <TextInput value={name} onChange={(name: string) => configService.setName(name)} label={'name'} />
          {props.configsManageable &&
            <ConfigManagerUi configItems={props.configItems} activeConfig={props.activeConfig} />
          }
        </>
      }
    </div>
    <Editor config={props.activeConfig} />
  </div>
}