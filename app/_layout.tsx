import React from 'react';
import { Tabs } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TransactionProvider } from '../context/TransactionContext';
import Toast from 'react-native-toast-message';

type RouteName = 'index' | 'add' | 'history' | 'charts';

interface IconMapping {
  focused: keyof typeof Ionicons.glyphMap;
  unfocused: keyof typeof Ionicons.glyphMap;
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#f5f5f5',
  },
};

const ICONS: Record<RouteName, IconMapping> = {
  index: {
    focused: 'home',
    unfocused: 'home-outline',
  },
  add: {
    focused: 'add-circle',
    unfocused: 'add-circle-outline',
  },
  history: {
    focused: 'list',
    unfocused: 'list-outline',
  },
  charts: {
    focused: 'pie-chart',
    unfocused: 'pie-chart-outline',
  },
};

export default function AppLayout() {
  return (
    <PaperProvider theme={theme}>
      <TransactionProvider>
        <Tabs
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const routeName = route.name as RouteName;
              const icons = ICONS[routeName];
              const iconName = icons
                ? focused
                  ? icons.focused
                  : icons.unfocused
                : 'help-outline';

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
