import React, { useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
//import { setUser } from './services/userService';
import StartScreen from './screens/StartScreen';
import MealScreen from './screens/MealScreen';
import SymptomScreen from './screens/SymptomScreen';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Start: undefined;
  Signup: undefined;
  Meal: undefined;
  Symptom: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// interface User {
//   name: string;
//   email: string;
// }
function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  // const [allUsers, setAllUsers] = useState<User[]>([]);

  // //get all users
  // async function fetchUsers() {
  //   const result = await getUser();
  //   console.log("fetched user:", result);
  //   setAllUsers(result);
  // }

  // useEffect(() => {
  //   fetchUsers();
  // }, []);
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
      <Button title="SignUp" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Home" component={HomeScreen} 
        options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Signup" component={SignupScreen}/>
        <Stack.Screen name="Meal" component={MealScreen}/>
        <Stack.Screen name="Symptom" component={SymptomScreen}/>
        <Stack.Screen name="Start" component={StartScreen}
        options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
