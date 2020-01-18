import { render } from "react-dom";
import React from "react";

import { GoldenSeedsView } from "./views/GoldenSeedsView";

import './index.styl';


render(
  <GoldenSeedsView />,
  document.getElementById('app')
);