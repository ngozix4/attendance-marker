/**
 * AuthNavigator
 * -------------
 * This stack navigator handles the authentication flow:
 * - Navigates between Login and Sign Up screens.
 * - Also allows navigation to StudentTabs or TeacherTabs after login/signup,
 *   depending on the user's role.
 *
 * Note: This navigator is typically used during onboarding or if you're separating
 * authentication routes from the main app navigator.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens used in the authentication flow
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Bottom tab navigators for role-based access
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Login screen as the entry point */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Sign Up screen for new users */}
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* Student view after successful login */}
      <Stack.Screen name="StudentTabs" component={StudentTabs} />

      {/* Teacher view after successful login */}
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
