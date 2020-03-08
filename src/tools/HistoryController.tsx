import React from "react";
import { DirectionButton, Direction } from "../ui/DirectionButton";
import { appStore } from "../store/AppStore";

export class HistoryController extends React.Component<{}> {

  render() {
    return (
      <React.Fragment>
        <a target="_blank" onClick={() => appStore.canUndo() && appStore.undo()}>
          <DirectionButton direction={Direction.LEFT} disabled={!appStore.canUndo()} title="undo" />
        </a>
        <a target="_blank" onClick={() => appStore.canRedo() && appStore.redo()}>
          <DirectionButton direction={Direction.RIGHT} disabled={!appStore.canRedo()} title="redo" />
        </a>
      </React.Fragment>
    );
  }
}
