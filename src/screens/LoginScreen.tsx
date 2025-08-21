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
    <View style={tw`flex-1 justify-center px-6 bg-[#F1F0E4]`}>
      <Text style={tw`text-3xl font-bold mb-8 text-center text-[#3E3F29]`}>Login</Text>

      <TextInput
        style={tw`border border-[#BCA88D] rounded-lg p-4 mb-5 bg-white text-[#3E3F29]`}
        placeholder="Email"
        placeholderTextColor="#7D8D86"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={tw`border border-[#BCA88D] rounded-lg p-4 mb-6 bg-white text-[#3E3F29]`}
        placeholder="Password"
        placeholderTextColor="#7D8D86"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        style={tw`bg-[#3E3F29] rounded-lg p-4 mb-6 shadow-md`}
        onPress={handleLogin}
      >
        <Text style={tw`text-white text-center font-bold text-lg`}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={tw`text-[#3E3F29] text-center text-base`}>Don't have an account? <Text style={tw`font-bold`}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}