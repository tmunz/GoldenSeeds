export class Queue<T> {

  private data: T[] = [];
  private curr: T;
  private prev: T;

  constructor(...elements: T[]) {
    this.data = elements;
  }

  push(element: T) {
    this.data.push(element);
  }

  pop(): T {
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
