import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';


export default function SignupScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    type RootStackParamList = {
        Home: undefined;
        Login: undefined;
        Signup: undefined;
      };
      
      const Stack = createNativeStackNavigator<RootStackParamList>();
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Signup'>>();

  
    async function handleSignup() {
        // 1. Call backend API with user credentials
        const response = await fetch('', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, username, password }),
        });

        if (response.ok) {
          console.log("yay")
          navigation.navigate('Login')
        } else {
          alert('signup failed');
        }
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
          placeholder="UserName"
          value={username}
          onChangeText={setUsername}
          className="border p-2 mb-4"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border p-2 mb-4"
        />
        <Button title="Login" onPress={handleSignup} />
      </View>
    );
  }

function saveToken(token: any) {
    throw new Error('Function not implemented.');
}
