import React, { useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import { getUser } from './services/userService';
import StartScreen from './screens/StartScreen';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Start: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface User {
  name: string;
  email: string;
}
function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  //get all users
  async function fetchUsers() {
    const result = await getUser();
    console.log("fetched user:", result);
    setAllUsers(result);
  }

  useEffect(() => {
    fetchUsers();
  }, []);
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Text> {allUsers.length > 0  && allUsers[0].name} </Text>
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
        <Stack.Screen name="Start" component={StartScreen}
        options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
