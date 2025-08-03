import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';



export default function SymptomScreen() {
    const [symptomList, setSymptomList] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    //const [show, setShow] = useState(true);
    
  


    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
        Start: undefined;
        Symptom: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Symptom'>>();

  
      //make function for adding the meal
    async function handleSymptom() {
      navigation.navigate("Start"); 
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
      <View className="flex-1 justify-center p-4">
        <Text>"Add Symptoms"</Text>
        
        <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={"date"}
            is24Hour={true}
            onChange={onChangeDate}
          />
          <DateTimePicker
            testID="dateTimePicker"
            value={time}
            mode={"time"}
            is24Hour={true}
            onChange={onChangeTime}
          />
        <Button title="update symptoms" onPress={handleSymptom} />
      </View>
    );
  }

