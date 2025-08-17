import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useContext, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import RBSheet from 'react-native-raw-bottom-sheet';
import { MultiSelect } from 'react-native-element-dropdown';
import { addSymptom } from '../services/symptomService';
import { AuthContext } from '../context/AuthContext';

export default function SymptomScreen() {
    const [symptomList, setSymptomList] = useState<string[]>([]);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const refRBSheet = useRef<any>(null);

    const auth = useContext(AuthContext);
    
    if (!auth) {
      throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
    }

    const { user } = auth;

    const symptomTags = [
      'Bloating',
      'Gas/flatulence',
      'Stomach cramps',
      'Heartburn/acid reflux',
      'Nausea',
      'Diarrhea',
      'Constipation',
      'Vomiting',
      'Loss of appetite',
      'Acidic taste',
      'Belching',
      'Indigestion',
      'Abdominal pain',
      'Feeling full quickly',
      'Food cravings',
      'Changes in bowel habits',
      'Mouth ulcers',
      'Excessive thirst',
      'Dry mouth',
      'Fatigue after eating',
      'Headache after eating',
      'Allergic reactions (rash, swelling)',
      'Difficulty swallowing',
      'Weight changes',
    // ].map((name, index) => ({ label: name, value: index.toString() }));
    ].map((name, index) => ({ label: name, value: name }));
    
    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
        Start: undefined;
        Symptom: undefined;
      };
      
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Symptom'>>();

    async function handleSymptom() {
      refRBSheet.current?.close()
      console.log("symptom list", symptomList);
      for (let symptom of symptomList){
        user && addSymptom(symptom, date, time.toTimeString().split(' ')[0], user.id);
      }
      navigation.navigate("Start"); 
      }

      async function onSymptomListChange(newSelected: string[]) {
        setSymptomList(newSelected);
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
      <View style={styles.container}>
        <Text>"Add Symptoms"</Text>
        <Button
          title="select symptoms"
          onPress={() => refRBSheet.current?.open()}
        />
        <RBSheet
          ref={refRBSheet}
          useNativeDriver={true}
          customStyles={{
            wrapper: {
              backgroundColor: 'transparent',
            },
            draggableIcon: {
              backgroundColor: '#000',
            },
            container: {
              height: 500,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          }}
          customModalProps={{
            animationType: 'slide',
            statusBarTranslucent: true,
          }}
          customAvoidingViewProps={{
            enabled: false,
          }}>
           <View style={{ padding: 16 }}>
            <MultiSelect 
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              search
              data={symptomTags}
              labelField="label"
              valueField="value"
              placeholder="Select item"
              searchPlaceholder="Search..."
              value={symptomList}
              onChange={(items: string[]) => {
                console.log("selected items", items)
                setSymptomList(items as string[]);
              }}
              selectedStyle={styles.selectedStyle}
            />
            </View>
            {/* <MultiSelect
              hideTags
              items={symptomTags}
              uniqueKey="id"
              ref={multiSelectRef}
              onSelectedItemsChange={onSymptomListChange}
              selectedItems={symptomList}
              selectText="Pick Items"
              searchInputPlaceholderText="Search Symptoms..."
              onChangeInput={ (text)=> console.log(text)}
              tagRemoveIconColor="#CCC"
              tagBorderColor="#CCC"
              tagTextColor="#CCC"
              selectedItemTextColor="#CCC"
              selectedItemIconColor="#CCC"
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{ color: '#CCC' }}
              submitButtonColor="#CCC"
              submitButtonText="Submit"
            /> */}
             <Button title="update symptoms" onPress={handleSymptom} />
        </RBSheet>

        
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
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { padding: 16 },
    dropdown: {
      height: 50,
      backgroundColor: 'transparent',
      borderBottomColor: 'gray',
      borderBottomWidth: 0.5,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 14,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    icon: {
      marginRight: 5,
    },
    selectedStyle: {
      borderRadius: 12,
    },
  });

