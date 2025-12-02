import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser, listMembers } from '../services/groupsService';
import { createExpense } from '../services/expenseService';

type RootStackParamList = {
  Expenses: undefined;
  ManualEntry: undefined;
  ReceiptReview: { items: Array<{ name: string; quantity: number; price: number }>; date?: string | null };
};

interface Roommate {
  id: number;
  email: string;
  first?: string;
  last?: string;
}

export default function ManualEntryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ManualEntry'>>();
  const auth = useContext(AuthContext);
  const { user } = auth || {};

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRoommates, setSelectedRoommates] = useState<number[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);

  // Load roommates from database
  useEffect(() => {
    const loadRoommates = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user's groups
        const groups = await listGroupsForUser(user.id);
        if (groups.length === 0) {
          setLoading(false);
          return;
        }

        // Get members from the first group (users can only be in one group)
        const group = groups[0];
        setGroupId(group.id);
        const members = await listMembers(group.id);
        
        // Include all members including the current user (they can buy items for themselves)
        setRoommates(members);
      } catch (error) {
        console.error('Error loading roommates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoommates();
  }, [user?.id]);

  const toggleRoommate = (roommateId: number) => {
    setSelectedRoommates((prev) =>
      prev.includes(roommateId) ? prev.filter((id) => id !== roommateId) : [...prev, roommateId]
    );
  };

  const getRoommateDisplayName = (roommate: Roommate): string => {
    if (roommate.id === user?.id) {
      return 'you';
    }
    if (roommate.first && roommate.last) {
      return `${roommate.first} ${roommate.last}`;
    }
    // Fallback to email if name not available
    return roommate.email.split('@')[0]; // Use part before @ as display name
  };

  const handleContinue = async () => {
    if (!itemName || !price) {
      Alert.alert('Missing Information', 'Please fill in item name and price');
      return;
    }

    if (!groupId || !user?.id) {
      Alert.alert('Error', 'You must be in a group to add expenses');
      return;
    }

    setSaving(true);
    try {
      const priceValue = parseFloat(price);
      
      // Calculate owed amount per person
      // Divide price by the number of selected people (including yourself if selected)
      // Round to 2 decimal places since it's money
      const totalPeople = selectedRoommates.length > 0 ? selectedRoommates.length : 1;
      const owedAmount = Math.round((priceValue / totalPeople) * 100) / 100;
      
      // Create shares only for selected people who are NOT the current user (the payer)
      // The current user doesn't owe themselves, so no share is created for them
      const shares = selectedRoommates
        .filter(userId => userId !== user.id) // Exclude the payer - they don't owe themselves
        .map(userId => ({
          userId,
          owedAmount,
        }));

      await createExpense({
        groupId,
        name: itemName,
        price: priceValue,
        shares,
      });

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save expense');
    } finally {
      setSaving(false);
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
          {loading ? (
            <ActivityIndicator size="small" color="#7D60A3" />
          ) : roommates.length === 0 ? (
            <Text style={styles.noRoommatesText}>No roommates found</Text>
          ) : (
            roommates.map((roommate) => (
              <TouchableOpacity
                key={roommate.id}
                style={[
                  styles.checkbox,
                  selectedRoommates.includes(roommate.id) && styles.checkboxChecked,
                ]}
                onPress={() => toggleRoommate(roommate.id)}
              >
                <Text
                  style={[
                    styles.checkboxText,
                    selectedRoommates.includes(roommate.id) && styles.checkboxTextChecked,
                  ]}
                >
                  {getRoommateDisplayName(roommate)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, saving && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
  noRoommatesText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

