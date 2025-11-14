import { Button, StyleSheet, Text, TouchableOpacity, TextInput, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp } from '@react-navigation/native-stack';
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
        Dashboard: undefined;
        RoommateDashboard: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

    if (!auth) {
      throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
    }

    const { login } = auth;
    async function handleLogin() {
      try {
        console.log(email, password);
        const data = await login(email, password);
        if (data.accessToken || data.refreshToken) {
          navigation.navigate("RoommateDashboard");
        }
      } catch (error) {
        alert("wrong password or email");
      }
    }
  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
      </TouchableWithoutFeedback>
      
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
    paddingTop: 150,  // add some padding from the top of the screen
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
