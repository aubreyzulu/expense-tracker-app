import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Text, Searchbar, Chip, useTheme } from 'react-native-paper';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function TransactionHistoryScreen(): JSX.Element {
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<
    'all' | 'income' | 'expense'
  >('all');
  const theme = useTheme();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === 'all' || transaction.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderItem = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
        <List.Item
          title={item.category}
          description={item.notes}
          left={(props) => (
            <List.Icon
              {...props}
              icon={
                item.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'
              }
              color={
                item.type === 'income'
                  ? theme.colors.primary
                  : theme.colors.error
              }
            />
          )}
          right={() => (
            <View style={styles.rowContainer}>
              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.amount,
                    {
                      color:
                        item.type === 'income'
                          ? theme.colors.primary
                          : theme.colors.error,
                    },
                  ]}
                >
                  ${item.amount.toFixed(2)}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.syncStatus}>{item.synced ? '✅' : '🔄'}</Text>
            </View>
          )}
        />
      </Animated.View>
    ),
    [theme.colors.primary, theme.colors.error]
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search transactions"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === 'all'}
          onPress={() => setSelectedType('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={selectedType === 'income'}
          onPress={() => setSelectedType('income')}
          style={styles.filterChip}
        >
          Income
        </Chip>
        <Chip
          selected={selectedType === 'expense'}
          onPress={() => setSelectedType('expense')}
          style={styles.filterChip}
        >
          Expense
        </Chip>
      </View>
      <FlatList
        data={filteredTransactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterChip: {
    marginHorizontal: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  syncStatus: {
    fontSize: 18,
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});
