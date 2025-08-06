import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp } from '@react-navigation/native-stack';
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
      <View style={styles.container}>
        <Text style={styles.loginTitle}>Log Into Your Account</Text>
        <TextInput
          placeholder="email"
          placeholderTextColor="#000000" 
          value={email}
          onChangeText={setEmail}
          style={styles.logInEntry}
        />
        <TextInput
          placeholder="password"
           placeholderTextColor="#000000"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.logInEntry}
        />
     
     <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={styles.button}>ready to login!</Text>
    </TouchableOpacity> 
      </View>
    );
  }

function saveToken(token: any) {
    throw new Error('Function not implemented.');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // white
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 200,  // add some padding from the top of the screen
  },
  loginTitle: {
    fontFamily: "Inter",
    fontSize: 25, 
    fontWeight: "700", 
    color: "#000000", 
    textAlign: "center",
    marginBottom: 20,
    padding: 20
  },
  logInEntry: {
    backgroundColor: "#D8F793", // green
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 320,
    alignItems: "center",
    fontFamily: "Inter",
    textAlign: "center",
    fontSize: 16, // loginSignup
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "700",   // bold
    color: "#7D60A3",    // whatever color you want
    textAlign: "center",
  },
});
