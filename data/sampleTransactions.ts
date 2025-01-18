import { Transaction } from '../types';

const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Personal Care',
  'Gifts',
  'Investments',
  'Salary',
  'Freelance',
  'Dividends',
  'Rental Income',
];

const getRandomAmount = (type: 'income' | 'expense'): number => {
  if (type === 'income') {
    return parseFloat((Math.random() * 2000 + 500).toFixed(2)); // Income between $500 and $2500
  } else {
    return parseFloat((Math.random() * 1000).toFixed(2)); // Expense between $0 and $1000
  }
};

const generateRandomTransaction = (id: number): Transaction => {
  /**
   * Set probability: 60% income, 40% expense
   */
  const type = Math.random() < 0.6 ? 'income' : 'expense';
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(type);
  const date = new Date(
    Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
  ).toISOString();
  const notes = `Sample ${type} for ${category}`;

  return {
    id: id.toString(),
    type,
    category,
    amount,
    date,
    notes,
    synced: false,
  };
};

export const sampleTransactions: Transaction[] = (() => {
  let transactions: Transaction[];
  let totalIncome: number;
  let totalExpenses: number;

  do {
    transactions = Array.from({ length: 100 }, (_, i) =>
      generateRandomTransaction(i + 1)
    );
    totalIncome = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    totalExpenses = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  } while (totalIncome <= totalExpenses); // Regenerate if income doesn't exceed expenses

  return transactions;
})();

export const transactionCategories = categories;
