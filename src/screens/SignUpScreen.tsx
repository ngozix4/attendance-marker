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
    <View style={tw`flex-1 justify-center items-center bg-[#F1F0E4] px-6`}>
      <Text style={tw`text-2xl font-bold mb-6 text-[#3E3F29]`}>Sign Up</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#7D8D86"
        value={name}
        onChangeText={setName}
        style={tw`w-full border border-[#BCA88D] p-4 mb-4 rounded-lg bg-white text-[#3E3F29]`}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#7D8D86"
        value={email}
        onChangeText={setEmail}
        style={tw`w-full border border-[#BCA88D] p-4 mb-4 rounded-lg bg-white text-[#3E3F29]`}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#7D8D86"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={tw`w-full border border-[#BCA88D] p-4 mb-5 rounded-lg bg-white text-[#3E3F29]`}
      />

      <Text style={tw`text-[#3E3F29] mb-2 self-start`}>Select Role:</Text>
      <View style={tw`flex-row justify-between w-full mb-6`}>
        <TouchableOpacity
          onPress={() => setRole('student')}
          style={tw`flex-1 py-3 mr-2 rounded-lg ${role === 'student' ? 'bg-[#3E3F29]' : 'bg-[#BCA88D]'}`}>
          <Text style={tw`text-center text-white font-semibold`}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRole('teacher')}
          style={tw`flex-1 py-3 ml-2 rounded-lg ${role === 'teacher' ? 'bg-[#3E3F29]' : 'bg-[#BCA88D]'}`}>
          <Text style={tw`text-center text-white font-semibold`}>Teacher</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignUp} style={tw`bg-[#3E3F29] w-full p-4 rounded-lg shadow-md`}>
        <Text style={tw`text-white text-center font-bold text-lg`}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;