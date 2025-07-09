import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { FIREBASE_APP } from '../services/firebase';
import tw from 'twrnc';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const auth = getAuth(FIREBASE_APP);
const db = getFirestore(FIREBASE_APP);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user's role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // Navigate based on role
        if (role === 'teacher') {
          navigation.navigate('TeacherTabs');
        } else {
          navigation.navigate('StudentTabs');
        }
      } else {
        Alert.alert('Error', 'No user role found for this account.');
      }
    } catch (error: any) {
      console.error('Login failed:', error.message);
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-6 bg-white`}>
      <Text style={tw`text-3xl font-bold mb-6 text-center`}>Login</Text>

      <TextInput
        style={tw`border border-gray-300 rounded p-3 mb-4`}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={tw`border border-gray-300 rounded p-3 mb-4`}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        style={tw`bg-blue-600 rounded p-3 mb-4`}
        onPress={handleLogin}
      >
        <Text style={tw`text-white text-center font-bold`}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={tw`text-blue-600 text-center`}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
