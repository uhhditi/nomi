import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {getLogs } from '../services/logService';
import { Image } from 'react-native';



export default function DashboardScreen() {

    type Log = {
        description: string;
      }
    
    const [recentLogs, setRecentLogs] = useState<String[]>(["", ""]);



    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
        Start: undefined;
        Dashboard: undefined;
        Symptom: undefined;
      };

     
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Dashboard'>>();

      //make method that displays two most recent meals 
      async function logData(){
        const logs: Log[] = await getLogs();
        const logDesc = logs.map(log => log.description);
        const twoMostRecent = logDesc.slice(0,2);
        setRecentLogs(twoMostRecent); 
      }

      useEffect(() => {
        logData();
      }, []);

    return (
        <View style = {styles.container}>
            <View style = {styles.headerRow}>
                <View style={{ alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 20 }}>
                    <Text style={styles.title}>Aditi's</Text>
                    <Text style={styles.title}>Food</Text>
                    <Text style={styles.title}>Diary</Text>
                </View>
                <View>
                    <Image 
                    source={require('/Users/aditia/Desktop/dygest-app/client/assets/pfp.png')}
                    style={{ width: 102, height: 100 }}  
                    />
                </View>
            </View>
            
            <View style = {styles.addRow}>
                <Text style = {styles.subtitle}> recent meals</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Meal")}>
                    <Text style = {styles.subtitle}>+ new meal</Text>
                </TouchableOpacity> 
            </View>
            <View style = {styles.mealColumn}>
                <Text style = {styles.meals}>{recentLogs[0]}</Text>
                <Text style = {styles.meals}>{recentLogs[1]}</Text>
            </View>
            <View style = {styles.addRow}>
                <Text style = {styles.subtitle}>symptom trends</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Symptom")}>
                    <Text style = {styles.subtitle}>+ new symptom</Text>
                </TouchableOpacity> 
            </View>
        </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF", // white
      //alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 20,  // add some padding from the top of the screen
      paddingHorizontal: 20,
    },
    subtitle: {
      fontFamily: "Inter",
      fontSize: 15, // smallText
      fontWeight: "400", // normal
      color: "#000000", // black
      textAlign: "left",
      marginTop: 15,       
    },
    addRow: {
      flexDirection: "row",
      justifyContent: "space-between",   // center horizontally
      alignItems: "center",
      width: 320,          
      alignSelf: "center",
      marginBottom: 10,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",   // center horizontally
        alignItems: "center",
        width: 320,          
        alignSelf: "center",
      },
    mealColumn: {
        flexDirection: "column",
        justifyContent: "center",   // center horizontally
        alignItems: "center",
        gap: 10,                 
        marginBottom: 10,
        width: '100%'
      },
    title: {
        fontFamily: "Inter",
        fontSize: 35, 
        fontWeight: "700", 
        color: "#000000", 
        textAlign: "left", 
    },
    meals: {
      backgroundColor: "#EFE7F8", //purple 
      paddingVertical: 28,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 5,
      width: 320,
      fontFamily: "Inter",
      textAlign: "center",
      fontSize: 16, 
      marginBottom: 5,
    },
    button: {
      backgroundColor: "#FFB563", // green
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 150,
      width: 240,
      alignItems: "center",
    },
    buttonText: {
      fontFamily: "Inter",
      fontSize: 15, // loginSignup
      fontWeight: "500", // extrabold
      color: "#00000", // white
    },
  });

