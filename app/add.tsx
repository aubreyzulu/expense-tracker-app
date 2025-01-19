import React, { useEffect, useState } from 'react';
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
import { router, usePathname } from 'expo-router';
import { transactionCategories } from '../data/sampleTransactions';
import { useForm, Controller } from 'react-hook-form';

export default function AddTransactionScreen(): JSX.Element {
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();
  const { addTransaction } = useTransactions();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
      category: '',
      notes: '',
      type: 'expense',
    },
  });

  const onSubmit = async (data: any) => {
    if (data.amount && data.category) {
      const newTransaction = {
        amount: parseFloat(data.amount),
        category: data.category,
        type: data.type,
        date: new Date().toISOString(),
        notes: data.notes,
        synced: false,
      };

      await addTransaction(newTransaction);
      reset();
      router.replace('/');
    }
  };

  useEffect(() => {
    if (pathname === '/add') {
      reset();
    }
  }, [pathname, reset]);

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
        <Text style={styles.title}>Add New Transaction</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={(val) => onChange(val)}
              buttons={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
              style={styles.segmentedButtons}
            />
          )}
        />
        <Controller
          control={control}
          name="amount"
          rules={{ required: 'Amount is required' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Amount"
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              error={!!errors.amount}
            />
          )}
        />
        {errors.amount && (
          <Text style={styles.errorText}>{errors.amount.message}</Text>
        )}

        <Controller
          control={control}
          name="category"
          rules={{ required: 'Category is required' }}
          render={({ field: { onChange, value } }) => (
            <>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Category"
                    value={value}
                    onFocus={() => setMenuVisible(true)}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.category}
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
                      onChange(cat);
                      setMenuVisible(false);
                    }}
                    title={cat}
                  />
                ))}
              </Menu>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category.message}</Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Notes"
              value={value}
              onChangeText={onChange}
              multiline
              style={styles.input}
              mode="outlined"
            />
          )}
        />
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
});
