import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';


export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    type RootStackParamList = {
        Home: undefined;
        Login: undefined;
      };
      
      const Stack = createNativeStackNavigator<RootStackParamList>();
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

  
    async function handleLogin() {
        // 1. Call backend API with user credentials
        const response = await fetch('', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      
        const data = await response.json();
      
        if (response.ok) {
          // 2. Save the token
          await saveToken(data.token);
          navigation.navigate('Home');
      
         
        } else {
          alert('Login failed');
        }
      }
  
    return (
      <View className="flex-1 justify-center p-4">
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
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

function saveToken(token: any) {
    throw new Error('Function not implemented.');
}
