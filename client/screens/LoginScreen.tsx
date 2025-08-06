import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IP_ADDRESS } from '@env'
import React from 'react';
import { loginUser } from '../services/userService';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const auth = useContext(AuthContext);

    type RootStackParamList = {
        Home: undefined;
        Meal: undefined;
        Login: undefined;
        Signup: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

    if (!auth) {
      throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
    }

    const { login } = auth;
    async function handleLogin() {
      try {
        const data = await login(email, password);
        if (data.accessToken || data.refreshToken) {
          navigation.navigate("Meal");
        }
      } catch (error) {
        alert("wrong password or email");
      }
    }
  
    return (
      <View className="flex-1 justify-center p-4">
        <TextInput
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          className="border p-2 mb-4"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border p-2 mb-4"
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

function saveToken(token: any) {
    throw new Error('Function not implemented.');
}
