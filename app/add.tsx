import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  useTheme,
  Text,
  Menu,
} from 'react-native-paper';
import { useTransactions } from '../context/TransactionContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { transactionCategories } from '../data/sampleTransactions';

export default function AddTransactionScreen(): JSX.Element {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [menuVisible, setMenuVisible] = useState(false);

  const { addTransaction } = useTransactions();
  const theme = useTheme();

  const handleAddTransaction = () => {
    if (amount && category) {
      const newTransaction = {
        amount: parseFloat(amount),
        category,
        type,
        date: new Date().toISOString(),
        notes,
      };
      addTransaction(newTransaction);
      router.replace('/');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
        <Text style={styles.title}>Add New Transaction</Text>
        <SegmentedButtons
          value={type}
          onValueChange={(value) => setType(value as 'expense' | 'income')}
          buttons={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          style={styles.segmentedButtons}
        />
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TextInput
              label="Category"
              value={category}
              onFocus={() => setMenuVisible(true)}
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon="menu-down"
                  onPress={() => setMenuVisible(true)}
                />
              }
            />
          }
        >
          {transactionCategories.map((cat) => (
            <Menu.Item
              key={cat}
              onPress={() => {
                setCategory(cat);
                setMenuVisible(false);
              }}
              title={cat}
            />
          ))}
        </Menu>
        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={styles.input}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={handleAddTransaction}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Add Transaction
        </Button>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});
