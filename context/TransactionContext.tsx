import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { sampleTransactions } from '../data/sampleTransactions';
import type { Transaction, TransactionContextType } from '../types';

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
      console.log(state.isConnected);
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
  const fetchServerTransactions = async (lastSyncTime: string): Promise<Transaction[]> => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('timestamp', '>', Timestamp.fromDate(new Date(lastSyncTime)))
      );
      
      const querySnapshot = await getDocs(q);
      const serverTransactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Transaction;

        serverTransactions.push({
          id: doc.id,
          amount: data.amount,
          category: data.category,
          date: data.date,
          notes: data.notes,
          type: data.type,
          synced: true,
        });
      });
      
      return serverTransactions;
    } catch (error) {
      console.error('Error fetching server transactions:', error);
      throw error;
    }
  };

  /**
   * Upload unsynced transactions to the server
   */
  const uploadTransactions = async (unsyncedTransactions: Transaction[]): Promise<void> => {
    try {
      const transactionsRef = collection(db, 'transactions');
      
      for (const transaction of unsyncedTransactions) {
        const { id, synced, ...transactionData } = transaction;
        await addDoc(transactionsRef, {
          ...transactionData,
          timestamp: Timestamp.fromDate(new Date(transaction.date))
        });
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
  const mergeTransactions = async (serverTransactions: Transaction[]): Promise<Transaction[]> => {
    try {
      const localTransactionsMap = new Map<string, Transaction>();
      transactions.forEach(tx => localTransactionsMap.set(tx.id, tx));

      const mergedTransactions = [...transactions];
      
      serverTransactions.forEach(serverTx => {
        if (!localTransactionsMap.has(serverTx.id)) {
          mergedTransactions.push({ ...serverTx, synced: true });
        }
      });

      return mergedTransactions;
    } catch (error) {
      console.error('Error merging transactions:', error);
      throw error;
    }
  };

  /**
   * Synchronize transactions with the server
   */
  const syncTransactions = async (): Promise<void> => {
    if (isSyncing) return;
    setIsSyncing(true);
    console.log('Starting sync process...');

    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log('No internet connection. Using offline data.');
        Toast.show({
          type: 'info',
          text1: 'Offline Mode',
          text2: 'Using local data. Will sync when online.',
        });
        return;
      }

      // Get unsynced transactions
      const unsyncedTransactions = getUnsyncedTransactions();
      console.log(`Found ${unsyncedTransactions.length} unsynced transactions`);

      if (unsyncedTransactions.length > 0) {
        Toast.show({
          type: 'info',
          text1: 'Syncing',
          text2: `Uploading ${unsyncedTransactions.length} transactions...`,
        });

        // Upload with retry logic
        const MAX_RETRIES = 5;
        let attempt = 0;
        let success = false;
        let delay = 1000;

        while (attempt < MAX_RETRIES && !success) {
          try {
            await uploadTransactions(unsyncedTransactions);
            await markTransactionsAsSynced(unsyncedTransactions.map(tx => tx.id));
            
            // Update AsyncStorage after successful sync
            const updatedTransactions = transactions.map(tx => 
              unsyncedTransactions.find(unsynced => unsynced.id === tx.id)
                ? { ...tx, synced: true }
                : tx
            );
            await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            setTransactions(updatedTransactions);
            
            success = true;
            Toast.show({
              type: 'success',
              text1: 'Upload Successful',
              text2: `${unsyncedTransactions.length} transactions synced.`,
            });
          } catch (error) {
            attempt += 1;
            if (attempt < MAX_RETRIES) {
              await sleep(delay);
              delay *= 2;
            } else {
              throw error;
            }
          }
        }
      }

      // Fetch and merge server transactions
      try {
        const lastSyncTime = await getLastSyncTime();
        const serverTransactions = await fetchServerTransactions(lastSyncTime);
        
        if (serverTransactions.length > 0) {
          // Merge with local transactions
          const mergedTransactions = await mergeTransactions(serverTransactions);
          
          // Update AsyncStorage with merged data
          await AsyncStorage.setItem('transactions', JSON.stringify(mergedTransactions));
          setTransactions(mergedTransactions);
          
          // Update last sync time
          const newSyncTime = new Date().toISOString();
          await updateLastSyncTime(newSyncTime);
          
          Toast.show({
            type: 'success',
            text1: 'Sync Complete',
            text2: `Updated with ${serverTransactions.length} new transactions.`,
          });
        }
      } catch (error) {
        console.error('Error during server sync:', error);
        Toast.show({
          type: 'error',
          text1: 'Sync Error',
          text2: 'Failed to sync with server. Local data preserved.',
        });
      }
    } catch (error) {
      console.error('Sync process failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Changes saved locally. Will retry when online.',
      });
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
    <TransactionContext.Provider
      value={{ transactions, addTransaction, syncTransactions }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
