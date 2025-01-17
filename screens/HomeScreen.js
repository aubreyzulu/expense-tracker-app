import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTransactions } from '../TransactionContext';

export default function HomeScreen() {
  const { transactions } = useTransactions();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.balanceText}>Current Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        </Card.Content>
      </Card>
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, styles.incomeCard]}>
          <Card.Content>
            <Text style={styles.summaryText}>Income</Text>
            <Text style={styles.summaryAmount}>${totalIncome.toFixed(2)}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.summaryCard, styles.expenseCard]}>
          <Card.Content>
            <Text style={styles.summaryText}>Expenses</Text>
            <Text style={styles.summaryAmount}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 18,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  incomeCard: {
    backgroundColor: '#4CAF50',
  },
  expenseCard: {
    backgroundColor: '#F44336',
  },
  summaryText: {
    fontSize: 16,
    color: '#fff',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
