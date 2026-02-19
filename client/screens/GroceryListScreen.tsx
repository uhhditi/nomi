import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getGroceryList, getGrocerySuggestions, addGroceryItem, updateGroceryItem, deleteGroceryItem, markGroceryPurchased } from '../services/groceryService';
import { listGroupsForUser } from '../services/groupsService';

const CATEGORIES = ['produce', 'dairy', 'pantry', 'household', 'other'];

export default function GroceryListScreen() {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const [groupId, setGroupId] = useState(null);
  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('produce');

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      const groups = await listGroupsForUser(user.id);
      if (groups.length === 0) return;
      setGroupId(groups[0].id);
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    Promise.all([
      getGroceryList(groupId),
      getGrocerySuggestions(groupId),
    ]).then(([list, sugg]) => {
      setItems(list);
      setSuggestions(sugg);
    }).catch(() => {
      Alert.alert('Error', 'Failed to load grocery list');
    }).finally(() => setLoading(false));
  }, [groupId]);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      const added = await addGroceryItem(groupId, newItem, category);
      setItems([added, ...items]);
      setNewItem('');
    } catch {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteGroceryItem(itemId);
      setItems(items.filter(i => i.item_id !== itemId));
    } catch {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handlePurchased = async (itemId) => {
    try {
      await markGroceryPurchased(itemId);
      setItems(items.map(i => i.item_id === itemId ? { ...i, is_purchased: true } : i));
    } catch {
      Alert.alert('Error', 'Failed to mark as purchased');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shared Grocery List</Text>
      </View>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add item..."
          value={newItem}
          onChangeText={setNewItem}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.catRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.catBtn, category === cat && styles.catBtnActive]} onPress={() => setCategory(cat)}>
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={items}
          keyExtractor={item => item.item_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={[styles.itemText, item.is_purchased && styles.purchased]}>{item.name}</Text>
              <View style={styles.actions}>
                {!item.is_purchased && (
                  <TouchableOpacity onPress={() => handlePurchased(item.item_id)}>
                    <Ionicons name="checkmark-circle" size={22} color="#2E7D32" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.item_id)}>
                  <Ionicons name="trash" size={22} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListHeaderComponent={() => suggestions.length > 0 && (
            <View style={styles.suggBox}>
              <Text style={styles.suggTitle}>Suggested Items</Text>
              {suggestions.map(s => (
                <Text key={s.item} style={styles.suggItem}>{s.item} (avg {s.avgDays.toFixed(1)}d)</Text>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#14141A', fontFamily: 'Inter' },
  addRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E4E3EE', borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: '#F7F6FD' },
  addBtn: { marginLeft: 8, backgroundColor: '#7D60A3', borderRadius: 8, padding: 10 },
  catRow: { flexDirection: 'row', marginBottom: 8 },
  catBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#E4E3EE', marginRight: 8 },
  catBtnActive: { backgroundColor: '#7D60A3' },
  catText: { color: '#14141A', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E4E3EE' },
  itemText: { fontSize: 16, color: '#14141A' },
  purchased: { textDecorationLine: 'line-through', color: '#8E8E93' },
  actions: { flexDirection: 'row', gap: 12 },
  suggBox: { backgroundColor: '#F7F6FD', borderRadius: 8, padding: 10, marginBottom: 10 },
  suggTitle: { fontWeight: '600', marginBottom: 4, color: '#7D60A3' },
  suggItem: { color: '#14141A', fontSize: 14 },
});
