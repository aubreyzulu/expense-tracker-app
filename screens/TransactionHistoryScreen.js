import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';
import { useTransactions } from '../TransactionContext';

export default function TransactionHistoryScreen() {
  const { transactions } = useTransactions();

  const renderItem = ({ item }) => (
    <List.Item
      title={item.category}
      description={item.notes}
      right={() => (
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              item.type === 'income' ? styles.income : styles.expense,
            ]}
          >
            ${parseFloat(item.amount).toFixed(2)}
          </Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      )}
    />
  );

  return (
    <FlatList
      data={transactions.sort((a, b) => new Date(b.date) - new Date(a.date))}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: '#4CAF50',
  },
  expense: {
    color: '#F44336',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});
