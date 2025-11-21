import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Expenses: undefined;
  ReceiptReview: { items: Array<{ name: string; quantity: number; price: number }> };
};

type ReceiptReviewRouteProp = RouteProp<RootStackParamList, 'ReceiptReview'>;

export default function ReceiptReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ReceiptReview'>>();
  const route = useRoute<ReceiptReviewRouteProp>();
  const { items } = route.params;

  // Mock roommates - replace with actual data from API
  const roommates = ['rm 1', 'rm 2', 'rm 3', 'rm 4', 'rm 5'];
  const [selectedRoommates, setSelectedRoommates] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    items.forEach((item) => {
      initial[item.name] = [...roommates]; // All selected by default
    });
    return initial;
  });

  const toggleRoommate = (itemName: string, roommate: string) => {
    setSelectedRoommates((prev) => {
      const current = prev[itemName] || [];
      const updated = current.includes(roommate)
        ? current.filter((r) => r !== roommate)
        : [...current, roommate];
      return { ...prev, [itemName]: updated };
    });
  };

  const handleComplete = () => {
    // TODO: Save expense data to API
    navigation.navigate('Expenses');
  };

  const handleAddNewItem = () => {
    // TODO: Navigate to add new item screen or show modal
    console.log('Add new item');
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
        <Text style={styles.title}>Here's what we found:</Text>

        {items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemDetail}>qty: {item.quantity}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.roommateRow}>
              {roommates.map((roommate) => (
                <TouchableOpacity
                  key={roommate}
                  style={[
                    styles.checkbox,
                    selectedRoommates[item.name]?.includes(roommate) && styles.checkboxChecked,
                  ]}
                  onPress={() => toggleRoommate(item.name, roommate)}
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      selectedRoommates[item.name]?.includes(roommate) && styles.checkboxTextChecked,
                    ]}
                  >
                    {roommate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addItemButton} onPress={handleAddNewItem}>
          <Ionicons name="add" size={20} color="#14141A" />
          <Text style={styles.addItemText}>Add new item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete</Text>
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
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemDetail: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
  },
  roommateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  addItemText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: CTA,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

