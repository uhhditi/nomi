import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IP_ADDRESS } from '@env'
import React from 'react';
import { loginUser } from '../services/userService';



export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    type RootStackParamList = {
        Home: undefined;
        Login: undefined;
        Signup: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

  
    async function handleLogin() {
      try {
        const data = await loginUser(email, password);
        if (data.success) {
          navigation.navigate("Home");
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
