import { Button, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IP_ADDRESS, PORT } from '@env'
import React from 'react';



export default function StartScreen() {

    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Start: undefined;
        Meal: undefined;
        Symptom: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Start'>>();

  
    async function checkLoginStatus() {
        //implement the check to see if user is already logged in and save their data w/ save token stuff 
      }

      useEffect(() => {
        console.log("Loaded IP_ADDRESS:", IP_ADDRESS);
    
        const url = `http://${IP_ADDRESS}:${PORT}/user/`;
        console.log("Testing URL:", url);
    
        fetch(url)
          .then(res => {
            console.log("HTTP Status:", res.status);
            return res.text();
          })
          .then(body => {
            console.log("Response body:", body);
          })
          .catch(err => {
            console.error("Fetch error:", err.message);
          });
      }, []);
  
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#7D60A3', fontSize: 40, fontWeight: '800' }}>dygest</Text>
            <Button title="login" onPress={() => navigation.navigate('Login')} />
            <Text>don't have an account yet?</Text>
            <Button title="signup" onPress={() => navigation.navigate('Signup')} />
            <Text>log a meal - testing for now</Text>
            <Button title="meal" onPress={() => navigation.navigate('Meal')} />
            <Text>log a symptom - testing </Text>
            <Button title="symptom" onPress={() => navigation.navigate('Symptom')} />
              
        </View>
      );
  }

