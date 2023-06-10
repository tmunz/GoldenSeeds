import React, { useState, useEffect } from 'react';

import { Editor } from '../domain/editor/Editor';
import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { svgService } from '../domain/svg/SvgService';
import { ConfigItem, configManager } from '../domain/config/ConfigManager';
import { PngExporter } from '../domain/png/PngExporter';
import { SvgExporter } from '../domain/svg/SvgExporter';
import { ConfigManagerUi } from '../domain/config/ConfigManagerUi';
import { ConfigImporter } from '../domain/config/ConfigImporter';
import { ConfigExporter } from '../domain/config/ConfigExporter';
import { configService } from '../domain/config/ConfigService';
import { CarouselSelector } from '../ui/CarouselSelector';
import { TextInput } from '../ui/input/TextInput';
import { AnimatedButton } from '../ui/AnimatedButton';
import { EditorNone, EditorClose, EditorRegular } from '../ui/icon/Editor';

import './GoldenSeedsView.styl';


export function GoldenSeedsView(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
}) {

  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    updateDimension();
    window.addEventListener('resize', updateDimension);
    return () => window.removeEventListener('resize', updateDimension);
  }, []);

  const updateDimension = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  const getExporterData = () => {
    return {
      name: props.activeConfig?.meta.name ?? 'drawing',
      svg: svgService.generateSvg(props.activeConfig?.stages, 1000, 1000) ?? '',
      dimensions: { width: 1000, height: 1000 },
    };
  };

  const name = props.activeConfig?.meta?.name;
  return (
    <div className="golden-seeds-view">
      {props.activeConfig && (
        <>
          <div
            className="canvas"
            style={{
              left: '48vw', // !this.state.editMode ? '48vw' : '52vw',
            }}
          >
            <SvgCanvas
              svgContent={svgService.generateSvg(
                props.activeConfig.stages,
                width * 1.04, // must be slightly larger, because of movement
                height,
                140,
              )}
              config={props.activeConfig}
            />
          </div>
          <div className={['sidebar', editMode ? '' : 'hidden'].join(' ')}>
            <AnimatedButton
              points={[EditorNone, EditorRegular, EditorClose]}
              active={editMode}
              onClick={(active) => setEditMode(!active)}
            />
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
        </>
      )}

      <div className="preconfig-bar">
        <CarouselSelector
          items={props.configItems}
          selected={props.activeConfig?.meta.name}
          select={id => configManager.select(id)}
          scale={3}
        />
      </div>
      <Themer />
    </div>
  );
}
