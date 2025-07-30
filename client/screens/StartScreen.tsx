import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IP_ADDRESS } from '@env'
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import React from 'react';


export default function StartScreen() {

    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Start: undefined;
        Meal: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Start'>>();

  
    async function checkLoginStatus() {
        //implement the check to see if user is already logged in and save their data w/ save token stuff 
      }
  
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>dygest</Text>
            <Button title="login" onPress={() => navigation.navigate('Login')} />
            <Text>don't have an account yet?</Text>
            <Button title="signup" onPress={() => navigation.navigate('Signup')} />
            <Text>log a meal - testing for now</Text>
            <Button title="signup" onPress={() => navigation.navigate('Meal')} />
              
        </View>
      );
  }

