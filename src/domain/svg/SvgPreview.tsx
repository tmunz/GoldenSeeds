import React from 'react';
import { useTranslation } from '../../i18n/I18n';

interface Props {
  svgKey: string;
  svgContent?: string;
}

export function SvgPreview(props: Props) {
  const { t } = useTranslation();
  const key = props.svgKey;
  const svgContent = props.svgContent ?? '';
  return (
    <div className="svg-preview">
      {process.env.MODE === 'production' ? (
        <img key={key} alt={t('preview.generated')} src={`data:image/svg+xml;base64,${window.btoa(svgContent)}`} />
      ) : (
        <div key={key} className="svg-debug-container" style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: svgContent }} />
      )}
    </div>
  );
}
