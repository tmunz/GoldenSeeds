import React from 'react';
import { useTranslation } from '../i18n/I18n';

import './DarkThemeToggle.css';

export function DarkThemeToggle(props: { active: boolean, onChange: (active: boolean) => void }) {
  const { t } = useTranslation();

  return (
    <div className="dark-theme-toggle" id="dark-theme" >
      <input
        type="checkbox"
        role="switch"
        aria-label={t('theme.dark')}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onChange(event.target.checked)}
        checked={props.active}
      />
    </div>
  );
}
