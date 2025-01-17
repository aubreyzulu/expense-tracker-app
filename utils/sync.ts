import NetInfo from '@react-native-community/netinfo';
import { getTransactions, addTransaction } from './database';
import { Transaction } from '../types';

const API_URL = 'https://your-api-url.com/transactions';

export const syncTransactions = async (): Promise<void> => {
  const netInfo = await NetInfo.fetch();

  if (netInfo.isConnected) {
    try {
      const localTransactions = await getTransactions();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localTransactions),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const serverTransactions: Transaction[] = await response.json();

      /**
       * Update local database with any new transactions from the server
       */
      for (const transaction of serverTransactions) {
        await addTransaction(transaction);
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
    }
  } else {
    console.log('No internet connection, sync skipped');
  }
};
