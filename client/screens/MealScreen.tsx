import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IP_ADDRESS } from '@env'
import React from 'react';



export default function MealScreen() {
    const [mealDesc, setMealDesc] = useState('');
    const [foodTags, setFoodTags] = useState('');
    const [symptomTags, setSymptomTags] = useState('');

    type RootStackParamList = {
        Home: undefined;
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Meal'>>();

  
    async function handleMeal() {
        // 1. Call backend API with user credentials
        const response = await fetch(`http://${IP_ADDRESS}:3001/user/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mealDesc, foodTags, symptomTags}),
        });
      
        const data = await response.json();
      
        if (response.ok) {
          // 2. Save the token
          console.log("yay")
      
         
        } else {
          alert('Login failed');
        }
      }
  
    return (
      <View className="flex-1 justify-center p-4">
        <TextInput
          placeholder="UserName"
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
        <Button title="Login" onPress={handleMeal} />
      </View>
    );
  }

function saveToken(token: any) {
    throw new Error('Function not implemented.');
}
