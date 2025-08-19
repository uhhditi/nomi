import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      'Heartburn',
      'Acid Reflux',
      'Nausea',
      'Diarrhea',
      'Constipation',
      'Vomiting',
      'Appetite Loss',
      'Acidic taste',
      'Belching',
      'Indigestion',
      'Abdominal pain',
      'Food cravings',
      'Changes in bowel habits',
      'Mouth ulcers',
      'Excessive thirst',
      'Dry mouth',
      'Fatigue after eating',
      'Headache after eating',
      'Allergic reactions',
      'Difficulty swallowing',
      'Weight changes',
    ].map((name, index) => ({ label: name, value: name }));
    
    type RootStackParamList = {
        Login: undefined;
        Signup: undefined;
        Meal: undefined;
        Start: undefined;
        Symptom: undefined;
        Dashboard: undefined;
      };
      
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Symptom'>>();

    async function handleSymptom() {
      refRBSheet.current?.close()
      console.log("symptom list", symptomList);
      for (let symptom of symptomList){
        user && addSymptom(symptom, date, time.toTimeString().split(' ')[0], user.id);
      }
      navigation.navigate("Dashboard"); 
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
      <View style={styles.background}>
        <Text style = {styles.title}>Add Symptoms</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => refRBSheet.current?.open()}>
              <Text style = {styles.buttonText}>select symptoms</Text>
        </TouchableOpacity>
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
                setSymptomList(items as string[]);
              }}
              selectedStyle={styles.selectedStyle}
            />
            </View>
        </RBSheet>
        <View style={styles.tagsContainer}>
          {symptomList.map((value) => {
            const label = symptomTags.find(tag => tag.value === value)?.label;
            return (
              <View key={value} style={styles.tag}>
                <Text style={styles.tagText}>{label}</Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.dateTimeRow}>
          <DateTimePicker
            value={date}
            mode="date"
            is24Hour={true}
            onChange={onChangeDate}
            style={styles.dateTimePicker}
          />
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            onChange={onChangeTime}
            style={styles.dateTimePicker}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSymptom}>
              <Text style = {styles.buttonText}>add symptoms</Text>
        </TouchableOpacity> 

      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { padding: 16 },
    dropdown: {
      height: 50,
      backgroundColor: '#ECFFC2',
      borderBottomColor: '#ECFFC2',
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
    background: {
      flex: 1,
      backgroundColor: "#FFFFFF", // white
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 90,  // add some padding from the top of the screen
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
      flexDirection: "row",
      justifyContent: "center",   // center horizontally
      alignItems: "center",
      gap: 20,                 
      marginBottom: 10,
    },
    dateTimePicker: {
      width: 120,                
    },
    title: {
      fontFamily: "Inter",
      fontSize: 25, 
      fontWeight: "700", 
      color: "#000000", 
      textAlign: "center",
      marginBottom: 20,
      padding: 20
    },
    button: {
      backgroundColor: "#D8F793", // green
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 30,
      marginBottom: 20,
      width: 240,
      alignItems: "center",
    },
    dropdownButton: {
      backgroundColor: "#ECFFC2", // light-green
      paddingVertical: 32,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 30,
      width: 300,
      alignItems: "center",
    },
    buttonText: {
      fontFamily: "Inter",
      fontSize: 15, 
      fontWeight: "500", 
      color: "#000000", // black
    },

    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      margin: 25,
      justifyContent: "center",
      gap: 4,
 
    },
    tag: {
      backgroundColor: "#D8F793",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      margin: 3,
    },
    tagText: {
      fontSize: 14,
      color: "#000",
      fontFamily: "Inter",
    }
    
  });
