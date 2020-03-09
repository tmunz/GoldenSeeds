export class HistoryManager<T> {

  private index: number;
  private history: T[];

  constructor(initial: T) {
    this.index = -1;
    this.history = [initial];
  }

  get currentElement() {
    return this.index < 0 ? undefined : this.history[this.index];
  }

  push(t: T) {
    this.index++;
    this.history.splice(this.index + 1);
    this.history.push(t);
  }

  undo(): T {
    this.index = Math.max(0, this.index - 1);
    return this.currentElement;
  }
  
  canUndo(): boolean {
    return 0 < this.index;
  }

  redo(): T {
    this.index = Math.min(this.index + 1, this.history.length - 1);
    return this.currentElement;
  }

  canRedo(): boolean {
    return this.index < this.history.length - 1;
  }

}
