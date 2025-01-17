import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';

export const initDatabase = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('transactions.db');

  await db.execAsync(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT
      );`);
};

export const addTransaction = async (
  transaction: Transaction
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('transactions.db');
  await db.runAsync(
    `INSERT INTO transactions (id, amount, category, type, date, notes) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      transaction.id,
      transaction.amount,
      transaction.category,
      transaction.type,
      transaction.date,
      transaction.notes,
    ]
  );
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const db = await SQLite.openDatabaseAsync('transactions.db');
  const result = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions;'
  );
  return result;
};
