import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n/I18n';
import { DialogHost } from './ui/DialogHost';

import './variables.css';
import './index.css';

const appElement = document.getElementById('app');
if (appElement) {
  createRoot(appElement).render(
    <StrictMode>
      <script>{`var version = "${process.env.APP_VERSION}"`}</script>
      <I18nProvider>
        <App />
        <DialogHost />
      </I18nProvider>
    </StrictMode>
  );
}
