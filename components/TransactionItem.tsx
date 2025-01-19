import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { Ionicons } from "@expo/vector-icons";
import type { Transaction } from "../types";

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const theme = useTheme();
  return (
    <View key={transaction.id} style={styles.transactionItem}>
      <Ionicons
        name={
          transaction.type === "income"
            ? "arrow-up-circle"
            : "arrow-down-circle"
        }
        size={24}
        color={
          transaction.type === "income"
            ? theme.colors.primary
            : theme.colors.error
        }
      />
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionCategory}>{transaction.category}</Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.date).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color:
              transaction.type === "income"
                ? theme.colors.primary
                : theme.colors.error,
          },
        ]}
      >
        ${transaction.amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
});
