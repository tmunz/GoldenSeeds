import React, { useState, useEffect } from "react";

import { Stream } from "./store/AppStore";

interface Props {
  stream: Stream;
  view: string | React.FunctionComponent<any> | React.ComponentClass<any, any>;
}

export const App = (props: Props) => {
  const [state, setState] = useState(props.stream());
  useEffect(() => props.stream.map(appState => setState(appState)));
  return React.createElement(props.view, state);
}
