import React from 'react';
// Import the bottom tab navigator from React Navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import the two main screens for the teacher interface
import TeacherScreen from '../screens/TeacherScreen';
import TeacherStatsScreen from '../screens/TeacherStatsScreen';

// Import Ionicons for tab bar icons
import { Ionicons } from '@expo/vector-icons';

// Create a bottom tab navigator instance
const Tab = createBottomTabNavigator();

// Main component that defines the bottom tab navigation for teachers
export default function TeacherTabs() {
  return (
    <Tab.Navigator
      // Set default options for all tabs
      screenOptions={{
        headerShown: false,            // Hide the header on all tab screens
        tabBarActiveTintColor: '#2563eb', // Set active tab icon/text color
      }}
    >
      {/* First tab: "Sessions" mapped to TeacherScreen */}
      <Tab.Screen
        name="Sessions"
        component={TeacherScreen}
        options={{
          // Set the icon for this tab using Ionicons
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Second tab: "Attendance" mapped to TeacherStatsScreen */}
      <Tab.Screen
        name="Attendance"
        component={TeacherStatsScreen}
        options={{
          // Set the icon for this tab using Ionicons
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
