import React, { useState, useEffect, useRef } from 'react';

import { SvgCanvas } from '../domain/svg/SvgCanvas';
import { Config } from '../domain/config/Config';
import { Themer } from '../themer/Themer';
import { svgService } from '../domain/svg/SvgService';
import { ConfigItem, configManager } from '../domain/config/ConfigManager';
import { CarouselSelector } from '../ui/CarouselSelector';
import { Sidebar } from './Sidebar';
import { useDimension } from '../utils/useDimension';

import './GoldenSeedsView.styl';
import { AnimatedButton } from '../ui/AnimatedButton';
import { EditorClose, EditorNone, EditorRegular } from '../ui/icon/Editor';


export function GoldenSeedsView(props: {
  configItems: ConfigItem[];
  configsManageable: boolean;
  activeConfig?: Config;
}) {

  const [editMode, setEditMode] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimension(mainContentRef);

  return (
    <div className={"golden-seeds-view" + (editMode ? ' edit-mode' : '')}>
      <AnimatedButton
        className="edit-button"
        points={[EditorNone, EditorRegular, EditorClose]}
        active={editMode}
        onClick={(active) => setEditMode(!active)}
      />
      {props.activeConfig && (
        <>
          <Sidebar
            activeConfig={props.activeConfig}
            configItems={props.configItems}
            configsManageable={props.configsManageable}
          />
          <div className='divider' />
          <section className="main-content" ref={mainContentRef}>
            <SvgCanvas
              svgContent={svgService.generateSvg(
                props.activeConfig.stages,
                (dimensions?.width ?? 100) * 0.8,
                (dimensions?.height ?? 100) * 0.8,
              )}
              config={props.activeConfig}
            />
            <div className="preconfig-bar">
              <CarouselSelector
                items={props.configItems}
                selected={props.activeConfig?.meta.name}
                select={id => configManager.select(id)}
                scale={3}
              />
            </div>
          </section>
        </>
      )}
      <Themer />
    </div>
  );
}
