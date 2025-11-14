import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Expenses: undefined;
  ManualEntry: undefined;
};

export default function ManualEntryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ManualEntry'>>();

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  // Mock roommates - replace with actual data from API
  const roommates = ['rm 1', 'rm 2', 'rm 3', 'rm 4', 'rm 5'];
  const [selectedRoommates, setSelectedRoommates] = useState<string[]>(roommates);

  const toggleRoommate = (roommate: string) => {
    setSelectedRoommates((prev) =>
      prev.includes(roommate) ? prev.filter((r) => r !== roommate) : [...prev, roommate]
    );
  };

  const handleContinue = () => {
    // TODO: Save expense data to API
    if (itemName && quantity && price) {
      navigation.navigate('Expenses');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.dollarSign}>$</Text>
        </View>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#14141A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add a new item:</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="enter item:"
            placeholderTextColor="#8E8E93"
            value={itemName}
            onChangeText={setItemName}
          />
          <View style={styles.inputUnderline} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="enter quantity:"
            placeholderTextColor="#8E8E93"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <View style={styles.inputUnderline} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="enter price:"
            placeholderTextColor="#8E8E93"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <View style={styles.inputUnderline} />
        </View>

        {/* Select Roommates Section */}
        <Text style={styles.sectionTitle}>select roommates:</Text>
        <View style={styles.roommateRow}>
          {roommates.map((roommate) => (
            <TouchableOpacity
              key={roommate}
              style={[
                styles.checkbox,
                selectedRoommates.includes(roommate) && styles.checkboxChecked,
              ]}
              onPress={() => toggleRoommate(roommate)}
            >
              <Text
                style={[
                  styles.checkboxText,
                  selectedRoommates.includes(roommate) && styles.checkboxTextChecked,
                ]}
              >
                {roommate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const BORDER = '#E4E3EE';
const CTA = '#7D60A3';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14141A',
    fontFamily: 'Inter',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#14141A',
    fontFamily: 'Inter',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#14141A',
    marginBottom: 24,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#14141A',
    paddingVertical: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#14141A',
    marginTop: 12,
    marginBottom: 16,
  },
  roommateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  checkbox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: CTA,
    borderColor: CTA,
  },
  checkboxText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  checkboxTextChecked: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: CTA,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

