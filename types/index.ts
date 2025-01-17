export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  notes: string;
  synced: boolean;
}

export interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (
    transaction: Omit<Transaction, 'id' | 'synced'>
  ) => Promise<void>;
}
