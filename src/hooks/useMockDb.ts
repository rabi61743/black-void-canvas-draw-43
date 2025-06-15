
import { useState, useEffect } from 'react';
import { MockDatabase } from '@/services/mockDb/MockDatabase';

export function useMockDb<T extends { id?: number | string; _id?: string }>(collection: string, query?: (item: T) => boolean) {
  const [data, setData] = useState<T[]>([]);
  const db = MockDatabase.getInstance();

  const loadData = () => {
    const result = query 
      ? db.query(collection as any, query)
      : db.getAll(collection as any);
    setData(result as T[]);
  };

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    // Listen for both storage events and custom events
    window.addEventListener('mockDbUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('mockDbUpdate', handleStorageChange);
    };
  }, [collection, query]);

  const create = (item: Omit<T, 'id' | '_id'>) => {
    const result = db.create(collection as any, item);
    
    // Update local state immediately
    setData(prev => [...prev, result as T]);
    
    // Notify other components about the change
    window.dispatchEvent(new Event('mockDbUpdate'));
    
    return result;
  };

  const update = (id: number, updates: Partial<T>) => {
    const result = db.update(collection as any, id, updates);
    if (result) {
      setData(prev => prev.map(item => 
        (item as any).id === id ? result : item
      ));
      window.dispatchEvent(new Event('mockDbUpdate'));
    }
    return result;
  };

  const remove = (id: number) => {
    const success = db.delete(collection as any, id);
    if (success) {
      setData(prev => prev.filter(item => (item as any).id !== id));
      window.dispatchEvent(new Event('mockDbUpdate'));
    }
    return success;
  };

  const getById = (id: number) => {
    return db.getById(collection as any, id);
  };

  const reset = () => {
    db.reset();
    loadData(); // Reload data immediately
    window.dispatchEvent(new Event('mockDbUpdate'));
  };

  const clear = () => {
    db.clear();
    loadData(); // Reload data immediately
    window.dispatchEvent(new Event('mockDbUpdate'));
  };

  return {
    data,
    create,
    update,
    remove,
    getById,
    reset,
    clear,
  };
}
