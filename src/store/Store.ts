import flyd from "flyd";
import { ObjectUtils, Patch } from "../utils/ObjectUtils";
import { HistoryManager } from "../utils/HistoryManager";

export type Stream<T> = flyd.Stream<T>;

export abstract class Store<T extends Object> {

  private _initialState: T;
  private _state: Stream<T>;
  private _update: Stream<Patch>;

  private _history: HistoryManager<T>;

  constructor(initialState: T, withHistory = true) {
    this._initialState = initialState;
    this._update = flyd.stream();

    this._state = flyd.scan<T, Patch>(this.reduce, initialState, this._update);

    if (withHistory) {
      this._history = this.createHistory();
    }
  }

  private reduce(source: any, { path, value, type }: { path: string[], value: any, type: string }) {
    switch (type) {
      case "set": return ObjectUtils.set<any>(source, { path, value });
      case "merge": return ObjectUtils.merge<any>(source, { path, value });
    }
  }

  get state(): Stream<T> {
    return this._state;
  }

  set(value: any, path: string[] = [], withHistory?: boolean) {
    this.update({ path, value, type: "set" }, withHistory);
  }

  merge(value: any, path: string[] = [], withHistory?: boolean) {
    this.update({ path, value, type: "merge" }, withHistory);
  }

  private update(next: { path: string[], value: any, type: string }, withHistory: boolean = true) {
    this._update(next);
    if (this.withHistory && withHistory) {
      this._history.push(this._state());
    }
  }

  reset() {
    this.set(this._initialState, [], false);
    if (this.withHistory) {
      this._history = this.createHistory();
    }
  }

  undo() {
    if (this.withHistory) {
      this.set(this._history.undo(), [], false);
    }
  }

  canUndo() {
    return this.withHistory && this._history.canUndo();
  }

  redo() {
    if (this.withHistory) {
      this.set(this._history.redo(), [], false);
    }
  }

  canRedo() {
    return this.withHistory && this._history.canRedo();
  }

  private get withHistory() {
    return typeof this._history !== "undefined";
  }

  private createHistory() {
    return new HistoryManager<T>(this._initialState);
  }
}