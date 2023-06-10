import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

import './variables.styl';
import './index.styl';

const appElement = document.getElementById('app');
if (appElement) {
  createRoot(appElement).render(
    <StrictMode>
      {process.env.APP_VERSION}
      <App />
    </StrictMode>
  );
}
