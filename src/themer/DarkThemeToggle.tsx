import React from 'react';

import './DarkThemeToggle.styl';

export function DarkThemeToggle(props: { active: boolean, onChange: (active: boolean) => void }) {

  return (
    <div className="dark-theme-toggle" id="dark-theme" >
      <input
        type="checkbox"
        role="switch"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onChange(event.target.checked)}
        checked={props.active}
      />
    </div>
  );
}
