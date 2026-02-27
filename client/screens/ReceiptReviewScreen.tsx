import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser, listMembers } from '../services/groupsService';
import { createExpense } from '../services/expenseService';

type RootStackParamList = {
  Expenses: undefined;
  ReceiptReview: { items: Array<{ name: string; quantity: number; price: number }>; date?: string | null };
  ManualEntry: undefined;
};

type ReceiptReviewRouteProp = RouteProp<RootStackParamList, 'ReceiptReview'>;

interface Roommate {
  id: number;
  email: string;
  first?: string;
  last?: string;
}

export default function ReceiptReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ReceiptReview'>>();
  const route = useRoute<ReceiptReviewRouteProp>();
  const { items, date } = route.params;
  const auth = useContext(AuthContext);
  const { user } = auth || {};

  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);

  // Editable copy of items
  const [editableItems, setEditableItems] = useState(items.map(item => ({ ...item })));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const [selectedRoommates, setSelectedRoommates] = useState<Record<string, number[]>>(() => {
    const initial: Record<string, number[]> = {};
    items.forEach((item) => {
      initial[item.name] = []; // Start with none selected
    });
    return initial;
  });

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

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditName(editableItems[index].name);
    setEditPrice(editableItems[index].price.toString());
  };

  const saveEdit = () => {
    if (!editName.trim()) { Alert.alert('Error', 'Item name cannot be empty.'); return; }
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) { Alert.alert('Error', 'Please enter a valid price.'); return; }

    setEditableItems(prev => {
      const updated = [...prev];
      const oldName = updated[editingIndex!].name;
      updated[editingIndex!] = { ...updated[editingIndex!], name: editName.trim(), price: parsedPrice };
      // Migrate selected roommates to new name key if name changed
      if (oldName !== editName.trim()) {
        setSelectedRoommates(prevSel => {
          const next = { ...prevSel };
          next[editName.trim()] = next[oldName] || [];
          delete next[oldName];
          return next;
        });
      }
      return updated;
    });
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const toggleRoommate = (itemName: string, roommateId: number) => {
    setSelectedRoommates((prev) => {
      const current = prev[itemName] || [];
      const updated = current.includes(roommateId)
        ? current.filter((id) => id !== roommateId)
        : [...current, roommateId];
      return { ...prev, [itemName]: updated };
    });
  };

  const getRoommateDisplayName = (roommate: Roommate): string => {
    if (roommate.first && roommate.last) {
      return `${roommate.first} ${roommate.last}`;
    }
    // Fallback to email if name not available
    return roommate.email.split('@')[0]; // Use part before @ as display name
  };

  const handleComplete = async () => {
    if (!groupId || !user?.id) {
      Alert.alert('Error', 'You must be in a group to add expenses');
      return;
    }

    setSaving(true);
    try {
      // Create an expense for each item
      const expensePromises = editableItems.map(async (item) => {
        const selectedUserIds = selectedRoommates[item.name] || [];
        
        // Calculate owed amount per person
        // Divide price by the number of selected people (including yourself if selected)
        // If no one is selected, the full price is the owed amount (edge case)
        // Round to 2 decimal places since it's money
        const totalPeople = selectedUserIds.length > 0 ? selectedUserIds.length : 1;
        const owedAmount = Math.round((item.price / totalPeople) * 100) / 100;
        
        // Create shares only for selected people who are NOT the current user (the payer)
        // The current user doesn't owe themselves, so no share is created for them
        const shares = selectedUserIds
          .filter(userId => userId !== user.id) // Exclude the payer - they don't owe themselves
          .map(userId => ({
            userId,
            owedAmount,
          }));

        return createExpense({
          groupId,
          name: item.name,
          price: item.price,
          shares,
        });
      });

      await Promise.all(expensePromises);

      Alert.alert('Success', 'Expenses added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Expenses'),
        },
      ]);
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save expenses');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewItem = () => {
    navigation.navigate('ManualEntry');
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
        
        {date && (
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#4A4A55" />
            <Text style={styles.dateText}>Date: {date}</Text>
          </View>
        )}

        {editableItems.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              {editingIndex === index ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.editNameInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Item name"
                    autoFocus
                  />
                  <TextInput
                    style={styles.editPriceInput}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                  <TouchableOpacity onPress={saveEdit} style={styles.editActionBtn}>
                    <Ionicons name="checkmark" size={20} color="#2E7D32" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit} style={styles.editActionBtn}>
                    <Ionicons name="close" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    {item.quantity !== undefined && item.quantity !== null && (
                      <Text style={styles.itemDetail}>qty: {item.quantity}</Text>
                    )}
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => startEditing(index)} style={styles.editIconBtn}>
                      <Ionicons name="pencil" size={14} color="#7D60A3" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            <View style={styles.roommateRow}>
              {loading ? (
                <ActivityIndicator size="small" color="#7D60A3" />
              ) : roommates.length === 0 ? (
                <Text style={styles.noRoommatesText}>No roommates found</Text>
              ) : (
                roommates.map((roommate) => {
                  const isCurrentUser = roommate.id === user?.id;
                  const displayName = isCurrentUser
                    ? 'you'
                    : getRoommateDisplayName(roommate);

                  return (
                    <TouchableOpacity
                      key={roommate.id}
                      style={[
                        styles.checkbox,
                        selectedRoommates[item.name]?.includes(roommate.id) && styles.checkboxChecked,
                      ]}
                      onPress={() => toggleRoommate(item.name, roommate.id)}
                    >
                      <Text
                        style={[
                          styles.checkboxText,
                          selectedRoommates[item.name]?.includes(roommate.id) && styles.checkboxTextChecked,
                        ]}
                      >
                        {displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addItemButton} onPress={handleAddNewItem}>
          <Ionicons name="add" size={20} color="#14141A" />
          <Text style={styles.addItemText}>Add new item</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.completeButton, saving && styles.completeButtonDisabled]} 
          onPress={handleComplete}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.completeButtonText}>Complete</Text>
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
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
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
  noRoommatesText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#6B7280',
    fontStyle: 'italic',
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
  completeButtonDisabled: {
    opacity: 0.6,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editNameInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    borderBottomWidth: 1,
    borderBottomColor: CTA,
    paddingVertical: 2,
  },
  editPriceInput: {
    width: 64,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    borderBottomWidth: 1,
    borderBottomColor: CTA,
    paddingVertical: 2,
    textAlign: 'right',
  },
  editActionBtn: {
    padding: 4,
  },
  editIconBtn: {
    padding: 4,
    marginLeft: 4,
  },
});

