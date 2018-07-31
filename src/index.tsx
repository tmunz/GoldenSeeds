import * as React from "react";
import * as ReactDOM from "react-dom";

import { GoldenSeedsView } from './views/GoldenSeedsView';

import './index.styl';


ReactDOM.render(
  <GoldenSeedsView />,
  document.getElementById('app')
);

module.hot.accept();