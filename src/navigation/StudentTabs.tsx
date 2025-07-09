import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StudentScreen from '../screens/StudentScreen';
import StudentStatsScreen from '../screens/StudentStatsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', // Tailwind blue-600
      }}
    >
      <Tab.Screen
        name="Scan"
        component={StudentScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Stats"
        component={StudentStatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
