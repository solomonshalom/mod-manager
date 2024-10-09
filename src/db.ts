import Dexie, { Table } from 'dexie';

export interface Mod {
  id?: number;
  name: string;
  description: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ModDatabase extends Dexie {
  mods!: Table<Mod, number>;

  constructor() {
    super('ModDatabase');
    this.version(2).stores({
      mods: '++id, name, category, createdAt, updatedAt'
    });
  }
}

export const db = new ModDatabase();