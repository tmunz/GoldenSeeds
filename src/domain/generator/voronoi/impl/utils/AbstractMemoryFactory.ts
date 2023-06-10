export abstract class AbstractMemoryFactory<T> {
  protected createdObjects: T[] = [];

  protected memorize(t: T) {
    this.createdObjects.push(t);
  }

  getAll(): T[] {
    return this.createdObjects;
  }
}
