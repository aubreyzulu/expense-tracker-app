import React from 'react';
import { Tabs } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TransactionProvider } from '../context/TransactionContext';
import Toast from 'react-native-toast-message';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#f5f5f5',
  },
};

export default function AppLayout() {
  return (
    <PaperProvider theme={theme}>
      <TransactionProvider>
        <Tabs
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'index') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'add') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
              } else if (route.name === 'history') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'charts') {
                iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { backgroundColor: 'white' },
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: 'white',
          })}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
            }}
          />
          <Tabs.Screen
            name="add"
            options={{
              title: 'Add Transaction',
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'Transaction History',
            }}
          />
          <Tabs.Screen
            name="charts"
            options={{
              title: 'Analytics',
            }}
          />
        </Tabs>
        <Toast />
      </TransactionProvider>
    </PaperProvider>
  );
}
