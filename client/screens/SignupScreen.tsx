import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setUser } from '../services/userService';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import React from 'react';
import { AuthContext } from '../context/AuthContext';

export default function SignupScreen() {
   // const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    type RootStackParamList = {
        Home: undefined;
        Login: undefined;
        Signup: undefined;
    };
      
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Signup'>>();

    const auth = useContext(AuthContext);

    if (!auth) {
      throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
    }

    const { register } = auth;
    async function handleSignup() {
        try {
          const data = await register(name, email, password); 
          console.log("register data", data); 
        } catch (err) {
          console.error(err);
        }
        navigation.navigate("Login");
      }
  
    return (
      <View className="flex-1 justify-center p-4">
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          className="border p-2 mb-4"
        />
        <TextInput
          placeholder="Email"
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
        <Button title="sign up" onPress={handleSignup} />
      </View>
    );
  }

function saveToken(token: any) {
    throw new Error('Function not implemented.');
}
