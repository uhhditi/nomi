import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.signUpTitle}>Sign Up</Text>
          <TextInput
            placeholder="name"
            placeholderTextColor="#000000"
            value={name}
            onChangeText={setName}
            style={styles.signUpEntry}
          />
          <TextInput
            placeholder="email"
            placeholderTextColor="#000000"
            value={email}
            onChangeText={setEmail}
            style={styles.signUpEntry}
          />
          <TextInput
            placeholder="password"
            value={password}
            placeholderTextColor="#000000"
            onChangeText={setPassword}
            secureTextEntry
            style={styles.signUpEntry}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.button}>ready to dygest!</Text>
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
    paddingTop: 90,  // add some padding from the top of the screen
  },
  signUpTitle: {
    fontFamily: "Inter",
    fontSize: 25, 
    fontWeight: "700", 
    color: "#000000", 
    textAlign: "center",
    marginBottom: 20,
    padding: 20
  },
  signUpEntry: {
    backgroundColor: "#FFB563", // orange
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: 320,
    alignItems: "center",
    fontFamily: "Inter",
    textAlign: "center",
    fontSize: 16, // loginSignup
    marginBottom: 15,
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
