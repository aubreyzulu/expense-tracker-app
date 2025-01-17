import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionContextType } from '../types';
import { sampleTransactions } from '../data/sampleTransactions';
import Toast from 'react-native-toast-message';

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      'useTransactions must be used within a TransactionProvider'
    );
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    loadTransactions();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncTransactions();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Load transactions from AsyncStorage or initialize with sample data
   */
  const loadTransactions = async (): Promise<void> => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        /**
         * Use sample data if no stored transactions
         */
        const initializedTransactions = sampleTransactions.map((tx) => ({
          ...tx,
          synced: false, // Ensure sample transactions are marked as unsynced
        }));
        setTransactions(initializedTransactions);
        await AsyncStorage.setItem(
          'transactions',
          JSON.stringify(initializedTransactions)
        );
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load transactions.',
      });
    }
  };

  /**
   * Add a new transaction
   */
  const addTransaction = async (
    newTransaction: Omit<Transaction, 'id' | 'synced'>
  ): Promise<void> => {
    try {
      const transactionWithId: Transaction = {
        ...newTransaction,
        id: uuidv4(),
        synced: false,
      };
      const updatedTransactions = [...transactions, transactionWithId];
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem(
        'transactions',
        JSON.stringify(updatedTransactions)
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Transaction added.',
      });
      /**
       * Attempt to sync after adding
       */
      syncTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add transaction.',
      });
    }
  };

  /**
   * Get unsynced transactions
   */
  const getUnsyncedTransactions = (): Transaction[] => {
    return transactions.filter((tx) => !tx.synced);
  };

  /**
   * Mark transactions as synced
   */
  const markTransactionsAsSynced = async (ids: string[]): Promise<void> => {
    try {
      const updatedTransactions = transactions.map((tx) =>
        ids.includes(tx.id) ? { ...tx, synced: true } : tx
      );
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem(
        'transactions',
        JSON.stringify(updatedTransactions)
      );
    } catch (error) {
      console.error('Error marking transactions as synced:', error);
    }
  };

  /**
   * Fetch new transactions from the server
   */
  const fetchServerTransactions = async (
    lastSyncTime: string
  ): Promise<Transaction[]> => {
    try {
      const response = await fetch(
        `https://your-api-url.com/transactions?since=${lastSyncTime}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch transactions from server.');
      }
      const serverTransactions: Transaction[] = await response.json();
      return serverTransactions;
    } catch (error) {
      console.error('Error fetching server transactions:', error);
      throw error;
    }
  };

  /**
   * Upload unsynced transactions to the server
   */
  const uploadTransactions = async (
    unsyncedTransactions: Transaction[]
  ): Promise<void> => {
    try {
      const response = await fetch(
        'https://your-api-url.com/transactions/upload',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unsyncedTransactions),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to upload transactions to server.');
      }
    } catch (error) {
      console.error('Error uploading transactions:', error);
      throw error;
    }
  };

  /**
   * Get the last synchronization timestamp
   */
  const getLastSyncTime = async (): Promise<string> => {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      return lastSync || new Date(0).toISOString(); // Default to epoch start
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return new Date(0).toISOString();
    }
  };

  /**
   * Update the last synchronization timestamp
   */
  const updateLastSyncTime = async (timestamp: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('lastSyncTime', timestamp);
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  };

  /**
   * Merge server transactions into local transactions
   */
  const mergeTransactions = async (
    serverTransactions: Transaction[]
  ): Promise<void> => {
    try {
      /**
       * Create a map for quick lookup
       */
      const localTransactionsMap = new Map<string, Transaction>();
      transactions.forEach((tx) => localTransactionsMap.set(tx.id, tx));

      /**
       *  Merge server transactions
       */
      const mergedTransactions: Transaction[] = [...transactions];
      serverTransactions.forEach((serverTx) => {
        if (!localTransactionsMap.has(serverTx.id)) {
          mergedTransactions.push({ ...serverTx, synced: true }); // Assume server transactions are synced
        }
      });

      setTransactions(mergedTransactions);
      await AsyncStorage.setItem(
        'transactions',
        JSON.stringify(mergedTransactions)
      );
    } catch (error) {
      console.error('Error merging transactions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to merge transactions.',
      });
    }
  };

  /**
   * Synchronize transactions with the server
   */
  const syncTransactions = async (): Promise<void> => {
    if (isSyncing) return; // Prevent multiple syncs at the same time
    setIsSyncing(true);
    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log('No internet connection. Sync skipped.');
        Toast.show({
          type: 'info',
          text1: 'Offline',
          text2: 'No internet connection. Sync skipped.',
        });
        setIsSyncing(false);
        return;
      }

      const unsyncedTransactions = getUnsyncedTransactions();
      if (unsyncedTransactions.length === 0) {
        console.log('All transactions are synced.');
        setIsSyncing(false);
        return;
      }

      Toast.show({
        type: 'info',
        text1: 'Syncing',
        text2: `Uploading ${unsyncedTransactions.length} transactions...`,
      });

      /**
       * Retry logic parameters
       */
      const MAX_RETRIES = 5;
      let attempt = 0;
      let success = false;
      let delay = 1000; // Start with 1 second

      while (attempt < MAX_RETRIES && !success) {
        try {
          await uploadTransactions(unsyncedTransactions);
          await markTransactionsAsSynced(
            unsyncedTransactions.map((tx) => tx.id)
          );
          success = true;
          Toast.show({
            type: 'success',
            text1: 'Upload Successful',
            text2: `${unsyncedTransactions.length} transactions synced.`,
          });
        } catch (error) {
          attempt += 1;
          console.error(`Upload attempt ${attempt} failed.`);
          if (attempt < MAX_RETRIES) {
            Toast.show({
              type: 'error',
              text1: 'Sync Failed',
              text2: `Retrying upload (${attempt}/${MAX_RETRIES})...`,
            });
            await sleep(delay);
            delay *= 2; // Exponential backoff
          } else {
            Toast.show({
              type: 'error',
              text1: 'Sync Failed',
              text2: 'Failed to sync transactions after multiple attempts.',
            });
            setIsSyncing(false);
            return;
          }
        }
      }

      /**
       *  After uploading, fetch new transactions from the server
       */
      try {
        const lastSyncTime = await getLastSyncTime();
        const serverTransactions = await fetchServerTransactions(lastSyncTime);
        if (serverTransactions.length > 0) {
          await mergeTransactions(serverTransactions);
          await updateLastSyncTime(new Date().toISOString());
          Toast.show({
            type: 'success',
            text1: 'Download Successful',
            text2: `Fetched ${serverTransactions.length} new transactions.`,
          });
        } else {
          console.log('No new transactions from server.');
        }
      } catch (error) {
        console.error('Error fetching server transactions:', error);
        Toast.show({
          type: 'error',
          text1: 'Sync Error',
          text2: 'Failed to fetch transactions from server.',
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Utility function to pause execution for a given time
   */
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
