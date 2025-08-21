/**
 * AppNavigator
 * ------------
 * This component controls the main navigation logic of the app based on user authentication
 * and role fetched from Firebase.
 *
 * - If the user is not logged in: show LoginScreen.
 * - If logged in and role is "student": show StudentTabs.
 * - If logged in and role is "teacher": show TeacherTabs.
 * - Shows a loading spinner while checking authentication and fetching user role.
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FIREBASE_AUTH, FIREBASE_DB } from '../services/firebase'; // Firebase config
import StudentTabs from './StudentTabs';     // Bottom tab navigation for students
import TeacherTabs from './TeacherTabs';     // Bottom tab navigation for teachers
import LoginScreen from '../screens/LoginScreen'; // Login screen

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);             // Tracks loading state while fetching user/role
  const [userRole, setUserRole] = useState<string | null>(null); // Stores the user's role (student/teacher)
  const [user, setUser] = useState(null);                   // Stores Firebase auth user

  // Monitor auth state and fetch user role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      if (authUser) {
        setUser(authUser); // Set the user object

        try {
          const docRef = doc(FIREBASE_DB, 'users', authUser.uid); // Reference to user's document
          const docSnap = await getDoc(docRef);                   // Fetch document

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role); // Set role: expected to be "student" or "teacher"
          } else {
            console.warn('No user role found in Firestore');
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        // If user is not logged in
        setUser(null);
        setUserRole(null);
      }

      setLoading(false); // Done loading once auth and role are handled
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Show a loading spinner while determining user state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  // Determine which screen to show based on auth and role
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Not logged in: show Login screen
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : userRole === 'student' ? (
        // Logged in as student: show student tab navigation
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
      ) : userRole === 'teacher' ? (
        // Logged in as teacher: show teacher tab navigation
        <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      ) : (
        // Fallback: if role is missing or invalid, send back to Login
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
