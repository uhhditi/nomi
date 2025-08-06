import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';



export default function MealScreen() {
    const [mealDesc, setMealDesc] = useState('');
    const [mealNotes, setMealNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    //const [show, setShow] = useState(true);

    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
        Start: undefined;
      };
      
      const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Meal'>>();

      //make function for adding the meal
    async function handleMeal() {
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
        <Text>"Add Meal"</Text>
        <Text>what did you eat?</Text>
        <TextInput
          placeholder="add details about your meal"
          value={mealDesc}
          onChangeText={setMealDesc}
          className="border p-2 mb-4"
        />
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
        <TextInput
          placeholder="notes"
          value={mealNotes}
          onChangeText={setMealNotes}
          className="border p-2 mb-4"
        />
        <Button title="add meal" onPress={handleMeal} />
      </View>
    );
  }

