export class MapCache<K, V> extends Map<K, V> {
  keyHistory: K[] = [];

  constructor(private cacheSize: number) {
    super();
  }

  set(key: K, value: V): this {
    this.keyHistory.push(key);
    if (this.cacheSize < this.keyHistory.length) {
      const toDeleteKey = this.keyHistory.shift();
      if (toDeleteKey) {
        this.delete(toDeleteKey);
      }
    }
    super.set(key, value);
    return this;
  }
}
