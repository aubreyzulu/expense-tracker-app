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

const generateRandomTransaction = (id: number): Transaction => {
  const type = Math.random() > 0.7 ? 'income' : 'expense';
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = parseFloat((Math.random() * 1000).toFixed(2));
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
  };
};

export const sampleTransactions: Transaction[] = Array.from(
  { length: 100 },
  (_, i) => generateRandomTransaction(i + 1)
);

export const transactionCategories = categories;
