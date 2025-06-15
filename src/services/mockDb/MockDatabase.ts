
export class MockDatabase {
  private static instance: MockDatabase;
  private data: Map<string, any[]> = new Map();
  private nextIds: Map<string, number> = new Map();

  constructor() {
    this.data = new Map();
    this.nextIds = new Map();
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  create<T extends { id?: number | string; _id?: string }>(table: string, item: Omit<T, 'id' | '_id'>): T {
    if (!this.data.has(table)) {
      this.data.set(table, []);
      this.nextIds.set(table, 1);
    }

    const items = this.data.get(table)!;
    const nextId = this.nextIds.get(table)!;
    
    const newItem = {
      ...item,
      id: nextId,
      _id: nextId.toString()
    } as T;

    items.push(newItem);
    this.nextIds.set(table, nextId + 1);
    
    return newItem;
  }

  getAll<T>(table: string): T[] {
    return this.data.get(table) || [];
  }

  query<T>(table: string, predicate: (item: T) => boolean): T[] {
    const items = this.data.get(table) || [];
    return items.filter(predicate);
  }

  getById<T extends { id?: number | string; _id?: string }>(table: string, id: number | string): T | undefined {
    const items = this.data.get(table) || [];
    return items.find((item: T) => 
      (item.id && item.id.toString() === id.toString()) || 
      (item._id && item._id === id.toString())
    );
  }

  update<T extends { id?: number | string; _id?: string }>(table: string, id: number | string, updates: Partial<T>): T | null {
    const items = this.data.get(table) || [];
    const index = items.findIndex((item: T) => 
      (item.id && item.id.toString() === id.toString()) || 
      (item._id && item._id === id.toString())
    );
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    return items[index];
  }

  delete<T extends { id?: number | string; _id?: string }>(table: string, id: number | string): boolean {
    const items = this.data.get(table) || [];
    const index = items.findIndex((item: T) => 
      (item.id && item.id.toString() === id.toString()) || 
      (item._id && item._id === id.toString())
    );
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    return true;
  }

  clear(): void {
    this.data.clear();
    this.nextIds.clear();
  }

  reset(): void {
    this.clear();
  }

  filter<T extends { [key: string]: any }>(table: string, predicate: (item: T) => boolean): T[] {
    const items = this.data.get(table) || [];
    return items.filter(predicate);
  }
}

export default MockDatabase;
