export class StorageManager<T> {
  private cache: Map<string, T> = new Map();
  private debounceTimeout?: number;

  constructor(
    private storageKey: string,
    private options = {
      debounceTime: 1000,
      maxItems: 100
    }
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const items = JSON.parse(data);
        items.forEach((item: T, key: string) => this.cache.set(key, item));
      }
    } catch (error) {
      console.error(`Failed to load data from storage for key ${this.storageKey}:`, error);
    }
  }

  private debouncedSave(): void {
    if (this.debounceTimeout) {
      window.clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(() => {
      try {
        const data = JSON.stringify(Array.from(this.cache.entries()));
        localStorage.setItem(this.storageKey, data);
      } catch (error) {
        console.error(`Failed to save data to storage for key ${this.storageKey}:`, error);
      }
    }, this.options.debounceTime);
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
    this.enforceSizeLimit();
    this.debouncedSave();
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.debouncedSave();
    }
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.debouncedSave();
  }

  private enforceSizeLimit(): void {
    if (this.cache.size > this.options.maxItems) {
      const keysToDelete = Array.from(this.cache.keys())
        .slice(0, this.cache.size - this.options.maxItems);
      
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }
}
