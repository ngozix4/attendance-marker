import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import StudentTabs from './StudentTabs'; // or wherever it's located
import TeacherTabs from './TeacherTabs';


const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen name="TeacherTabs" component={TeacherTabs}/>

    </Stack.Navigator>
  );
};

export default AuthNavigator;
