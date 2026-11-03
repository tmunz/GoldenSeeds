import React, { CSSProperties } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { Handle, Position, useNodeConnections } from '@xyflow/react';
import { PortValueType } from '../model/PortValue';
import { PortGuidance } from '../editor/ConnectionGuidance';
import { portColor } from './PortColors';

import './GraphPortHandle.css';

export function GraphPortHandle({ id, direction, portType, guidance }: {
  id: string;
  direction: 'source' | 'target';
  portType: PortValueType;
  guidance?: PortGuidance;
}) {
  const { t } = useTranslation();
  const connected = useNodeConnections({ handleType: direction, handleId: id }).length > 0;
  return <Handle
    id={id}
    type={direction}
    position={direction === 'source' ? Position.Right : Position.Left}
    className={`graph-port-handle ${connected ? 'port-connected' : 'port-unconnected'}${guidance ? ` port-${guidance}` : ''}`}
    isConnectableEnd={guidance !== 'incompatible'}
    title={t('ports.tooltip', {
      type: t(`ports.${portType}`, {}, portType), direction: t(`ports.${direction === 'source' ? 'output' : 'input'}`),
      state: t(`ports.${connected ? 'connected' : 'unconnected'}`), guidance: guidance === 'compatible' ? ` · ${t('ports.compatible')}` : '',
    })}
    aria-label={t('ports.description', {
      type: t(`ports.${portType}`, {}, portType), direction: t(`ports.${direction === 'source' ? 'output' : 'input'}`),
      state: t(`ports.${connected ? 'connected' : 'unconnected'}`),
    })}
    style={{ '--portColor': portColor(portType) } as CSSProperties}
  />;
}
