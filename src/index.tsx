import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

import './variables.styl';
import './index.styl';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);