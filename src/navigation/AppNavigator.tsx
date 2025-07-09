// navigation/AppNavigator.tsx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FIREBASE_AUTH, FIREBASE_DB } from '../services/firebase';
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState(null);

  // Monitor auth changes and fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const docRef = doc(FIREBASE_DB, 'users', authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role); // expected "student" or "teacher"
          } else {
            console.warn('No user role found in Firestore');
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Show a spinner while checking user and fetching role
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // If no user is logged in
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : userRole === 'student' ? (
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
      ) : userRole === 'teacher' ? (
        <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      ) : (
        // fallback if role is not found
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
