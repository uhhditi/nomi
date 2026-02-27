import React, { useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
//import { setUser } from './services/userService';
import StartScreen from './screens/StartScreen';
import MealScreen from './screens/MealScreen';
import SymptomScreen from './screens/SymptomScreen';
import { AuthProvider } from './context/AuthContext';
import DashboardScreen from './screens/DashboardScreen';
import RoommateDashboardScreen from './screens/RoommateDashboardScreen';
import GroceryListScreen from './screens/GroceryListScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';
import ChoreTrackerScreen from './screens/ChoreTrackerScreen';
import RulesScreen from './screens/RulesScreen';
import NomiStartScreen from './screens/NomiStartScreen';
import SettingsScreen from './screens/SettingsScreen';
import GroupWorkflowScreen from './screens/GroupWorkflowScreen';
import ManageGroupScreen from './screens/ManageGroupScreen';
import JoinOrCreateGroupScreen from './screens/JoinOrCreateGroupScreen';
import JoinGroupScreen from './screens/JoinGroupScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import ReceiptScannerScreen from './screens/ReceiptScannerScreen';
import ReceiptReviewScreen from './screens/ReceiptReviewScreen';
import ManualEntryScreen from './screens/ManualEntryScreen';

type RootStackParamList = {
  Home: undefined;
  Start: undefined;
  Signup: undefined;
  Meal: undefined;
  Dashboard: undefined;
  Symptom: undefined;
  RoommateDashboard: undefined;
  GroceryList: undefined;
  CreateGroup: undefined;
  ChoreTracker: undefined;
  Rules: undefined;
  NomiStart: undefined;
  Settings: undefined;
  GroupWorkflow: undefined;
  JoinOrCreateGroup: undefined;
  JoinGroup: undefined;
  ManageGroup: undefined;
  Expenses: undefined;
  ReceiptScanner: undefined;
  ReceiptReview: { items: Array<{ name: string; quantity?: number; price: number }>; date?: string | null };
  ManualEntry: undefined;
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
      <Button title="SignUp" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
      <Stack.Navigator initialRouteName="NomiStart">
        <Stack.Screen name="Home" component={HomeScreen} 
        options={{ headerShown: false }}/>
        <Stack.Screen name="Signup" component={SignupScreen}/>
        <Stack.Screen name="Dashboard" component={DashboardScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen name="Meal" component={MealScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen name="Symptom" component={SymptomScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen name="ChoreTracker" component={ChoreTrackerScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen name="Rules" component={RulesScreen}
        options={{ headerShown: false }}/>
        <Stack.Screen name="Start" component={StartScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="RoommateDashboard" component={RoommateDashboardScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="GroceryList" component={GroceryListScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="NomiStart" component={NomiStartScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="GroupWorkflow" component={GroupWorkflowScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="JoinOrCreateGroup" component={JoinOrCreateGroupScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="JoinGroup" component={JoinGroupScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="ManageGroup" component={ManageGroupScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="Expenses" component={ExpensesScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="ReceiptReview" component={ReceiptReviewScreen}
        options={{ headerShown: false }} />
        <Stack.Screen name="ManualEntry" component={ManualEntryScreen}
        options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
    
  );
}
