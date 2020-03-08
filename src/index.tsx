import { render } from "react-dom";
import React from "react";

import { App } from "./App";
import { GoldenSeedsView } from "./view/GoldenSeedsView";
import { appStore } from "./store/AppStore";

import './variables.styl';
import './index.styl';


render(
  <App stream={appStore.state} view={GoldenSeedsView} />,
  document.getElementById('app')
);