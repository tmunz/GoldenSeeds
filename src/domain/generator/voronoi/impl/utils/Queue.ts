export class Queue<T> {
  private data: T[] = [];
  private curr: T | undefined = undefined;
  private prev: T | undefined = undefined;

  constructor(...elements: T[]) {
    this.data = elements;
  }

  push(element: T) {
    this.data.push(element);
  }

  pop(): T | undefined {
    this.prev = this.curr;
    this.curr = this.data.pop();
    return this.curr;
  }

  getCurrent() {
    return this.curr;
  }

  getPrevious() {
    return this.prev;
  }
}
