import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';
import { Transaction } from '../types';
import { useTheme } from 'react-native-paper';

interface HistoryItemProps {
  item: Transaction;
  index: number;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, index }) => {
  const theme = useTheme();

  return (
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
            item.type === 'income' ? theme.colors.primary : theme.colors.error
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
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
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
});
