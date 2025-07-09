// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const navigation = useNavigation();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Save user data in Firestore
      await setDoc(doc(FIREBASE_DB, 'users', user.uid), {
        name,
        email,
        role,
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login'); // Redirect to login
    } catch (error: any) {
      Alert.alert('Sign up failed', error.message);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-white px-6`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Sign Up</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={tw`w-full border p-3 mb-4 rounded`}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={tw`w-full border p-3 mb-4 rounded`}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={tw`w-full border p-3 mb-4 rounded`}
      />

      <View style={tw`flex-row justify-between w-full mb-4`}>
        <TouchableOpacity
          onPress={() => setRole('student')}
          style={tw`flex-1 py-2 mr-2 rounded bg-${role === 'student' ? 'blue-500' : 'gray-300'}`}>
          <Text style={tw`text-center text-white`}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRole('teacher')}
          style={tw`flex-1 py-2 ml-2 rounded bg-${role === 'teacher' ? 'blue-500' : 'gray-300'}`}>
          <Text style={tw`text-center text-white`}>Teacher</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignUp} style={tw`bg-blue-500 px-4 py-3 rounded`}>
        <Text style={tw`text-white text-center`}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;
