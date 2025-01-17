import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { useTransactions } from '../context/TransactionContext';
import { Text, SegmentedButtons, useTheme } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

type ChartType = 'pie' | 'bar' | 'line';

export default function ChartsScreen(): JSX.Element {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<ChartType>('pie');
  const theme = useTheme();

  const screenWidth = Dimensions.get('window').width;

  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieChartData: ChartData[] = Object.entries(expensesByCategory).map(
    ([category, amount], index) => ({
      name: category,
      amount,
      color: `hsl(${index * 37}, 70%, 50%)`,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    })
  );

  const barChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
      },
    ],
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
      },
    ],
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart
            data={pieChartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        );
      case 'bar':
        return (
          <BarChart
            data={barChartData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundGradientFrom: theme.colors.background,
              backgroundGradientTo: theme.colors.background,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.text,
            }}
            verticalLabelRotation={30}
          />
        );
      case 'line':
        return (
          <LineChart
            data={lineChartData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundGradientFrom: theme.colors.background,
              backgroundGradientTo: theme.colors.background,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.text,
            }}
            bezier
          />
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
        <Text style={styles.title}>Expense Analytics</Text>
        <SegmentedButtons
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
          buttons={[
            { value: 'pie', label: 'Pie Chart' },
            { value: 'bar', label: 'Bar Chart' },
            { value: 'line', label: 'Line Chart' },
          ]}
          style={styles.segmentedButtons}
        />
        {renderChart()}
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
});
