import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addLog } from '../services/logService';
import { AuthContext } from '../context/AuthContext';


export default function MealScreen() {
    const [mealDesc, setMealDesc] = useState('');
    const [mealNotes, setMealNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    //const [show, setShow] = useState(true);

    const auth = useContext(AuthContext);
    
    if (!auth) {
      throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
    }

    const { user } = auth;

    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
        Start: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Meal'>>();

    
      //make function for adding the meal
    async function handleMeal() {
      console.log("in handle meal");
      user && addLog(mealDesc, mealNotes, date, time.toTimeString().split(' ')[0], user.id);
    }

    const onChangeDate = (event: any, selectedDate: any) => {
        const currentDate = selectedDate;
        setDate(currentDate);
    };

    const onChangeTime = (event: any, selectedTime: any) => {
      const currentTime = selectedTime;
      setTime(currentTime);
    };

  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container} >
        <Text style={styles.mealTitle}>Add Meal</Text>
        <Text style={styles.subtitle}>what did you eat?</Text>
        <TextInput
          placeholder=""
          value={mealDesc}
          onChangeText={setMealDesc}
          style={styles.mealEntry}
        />
        <View style={styles.dateTimeRow}>
        <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={"date"}
            is24Hour={true}
            onChange={onChangeDate}
            style={styles.dateTimePicker}
          />
          <DateTimePicker
            testID="dateTimePicker"
            value={time}
            mode={"time"}
            is24Hour={true}
            onChange={onChangeTime}
            style={styles.dateTimePicker}
          />
        </View>
        
        <Text style={styles.subtitle}>notes:</Text>
        <TextInput
          placeholder=""
          value={mealNotes}
          onChangeText={setMealNotes}
          style={styles.notesEntry}
        />
        <TouchableOpacity style={styles.button} onPress={handleMeal}>
          <Text style = {styles.buttonText}>add meal</Text>
        </TouchableOpacity> 
      </View>
      </TouchableWithoutFeedback>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF", // white
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 60,  // add some padding from the top of the screen
    },
    subtitle: {
      fontFamily: "Inter",
      fontSize: 15, // smallText
      fontWeight: "400", // normal
      color: "#000000", // black
      textAlign: "left",
      marginTop: 15,
      width: 320,        
      paddingLeft: 4  
    },
    dateTimeRow: {
      width: 260,                  // match text input width
      flexDirection: "row",        // side-by-side
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    dateTimePicker: {
      flex: 1,             // take equal space
    },
    mealTitle: {
      fontFamily: "Inter",
      fontSize: 25, 
      fontWeight: "700", 
      color: "#000000", 
      textAlign: "center",
      marginBottom: 20,
      padding: 20
    },
    mealEntry: {
      backgroundColor: "#FFDAB0", 
      paddingVertical: 38,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 10,
      width: 320,
      alignItems: "center",
      fontFamily: "Inter",
      textAlign: "center",
      fontSize: 16, 
      marginBottom: 15,
    },
    notesEntry: {
      backgroundColor: "#FFDAB0", 
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 10,
      width: 320,
      alignItems: "center",
      fontFamily: "Inter",
      textAlign: "center",
      fontSize: 16, 
      marginBottom: 15,
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