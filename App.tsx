import React, { useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import { getLogs } from './services/logService';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Log {
  meal: string;
  symptom: string;
  notes: string;
  created_at: string;
  user_id: number;
}
function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const [allLogs, setAllLogs] = useState<Log[]>([]);

  //get all logs
  async function fetchLogs() {
    const result = await getLogs();
    console.log("fetched logs:", result);
    setAllLogs(result);
  }

  useEffect(() => {
    fetchLogs();
  }, []);
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Text> {allLogs.length > 0  && allLogs[0].meal} </Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
      <Button title="SignUp" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
