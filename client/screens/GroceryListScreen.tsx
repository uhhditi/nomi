import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import {
  getGroceryList,
  getGrocerySuggestions,
  addGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
  markGroceryPurchased,
} from '../services/groceryService';
import { listGroupsForUser, listMembers } from '../services/groupsService';
import { createExpense } from '../services/expenseService';

const CATEGORIES = ['produce', 'dairy', 'pantry', 'household', 'other'];

const CATEGORY_BG: Record<string, string> = {
  produce: '#E8F5E9',
  dairy: '#E3F2FD',
  pantry: '#FFF8E1',
  household: '#F3E5F5',
  other: '#EEEEEE',
};

const CATEGORY_FG: Record<string, string> = {
  produce: '#2E7D32',
  dairy: '#1565C0',
  pantry: '#E65100',
  household: '#6A1B9A',
  other: '#424242',
};

interface GroceryItem {
  item_id: number;
  group_id: number;
  name: string;
  category: string;
  added_by: number;
  is_suggested: boolean;
  is_purchased: boolean;
  created_at: string;
  updated_at: string;
}

interface Suggestion {
  item: string;
  avgDays: number;
  daysSince: number;
}

interface Member {
  id: number;
  email: string;
  first?: string;
  last?: string;
}

export default function GroceryListScreen() {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const { user } = auth || {};

  const [groupId, setGroupId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Add item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('produce');
  const [adding, setAdding] = useState(false);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('other');
  const [saving, setSaving] = useState(false);

  // Purchase modal
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<GroceryItem | null>(null);
  const [convertToExpense, setConvertToExpense] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Load group and members
  useEffect(() => {
    const loadGroup = async () => {
      if (!user?.id) return;
      try {
        const groups = await listGroupsForUser(user.id);
        if (groups.length === 0) { setLoading(false); return; }
        const group = groups[0];
        setGroupId(group.id);
        const mems = await listMembers(group.id);
        setMembers(mems);
      } catch {
        setLoading(false);
      }
    };
    loadGroup();
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!groupId) return;
    try {
      const [list, sugg] = await Promise.all([
        getGroceryList(groupId),
        getGrocerySuggestions(groupId),
      ]);
      setItems(list);
      setSuggestions(sugg);
    } catch {
      Alert.alert('Error', 'Failed to load grocery list');
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [groupId, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Add a new item
  const handleAdd = async () => {
    if (!newItemName.trim() || !groupId) return;
    setAdding(true);
    try {
      const added = await addGroceryItem(groupId, newItemName.trim(), newItemCategory);
      setItems(prev => [added, ...prev]);
      setNewItemName('');
    } catch {
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  // Add a suggested item to the list
  const handleAddSuggestion = async (s: Suggestion) => {
    if (!groupId) return;
    try {
      const added = await addGroceryItem(groupId, s.item, 'other');
      setItems(prev => [added, ...prev]);
      setSuggestions(prev => prev.filter(x => x.item !== s.item));
    } catch {
      Alert.alert('Error', 'Failed to add suggested item');
    }
  };

  // Delete item
  const handleDelete = (itemId: number) => {
    Alert.alert('Remove Item', 'Remove this item from the list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGroceryItem(itemId);
            setItems(prev => prev.filter(i => i.item_id !== itemId));
          } catch {
            Alert.alert('Error', 'Failed to remove item');
          }
        },
      },
    ]);
  };

  // Open edit modal
  const openEdit = (item: GroceryItem) => {
    setEditItem(item);
    setEditName(item.name);
    setEditCategory(item.category || 'other');
    setEditModalVisible(true);
  };

  // Save edited item
  const handleSaveEdit = async () => {
    if (!editItem || !editName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateGroceryItem(editItem.item_id, {
        name: editName.trim(),
        category: editCategory,
      });
      setItems(prev => prev.map(i => i.item_id === editItem.item_id ? updated : i));
      setEditModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  // Open purchase modal
  const openPurchaseModal = (item: GroceryItem) => {
    setPurchaseItem(item);
    setConvertToExpense(false);
    setPurchasePrice('');
    setPurchaseModalVisible(true);
  };

  // Confirm purchase (with optional expense conversion)
  const handlePurchase = async () => {
    if (!purchaseItem || !groupId || !user?.id) return;

    if (convertToExpense) {
      const price = parseFloat(purchasePrice);
      if (!purchasePrice || isNaN(price) || price <= 0) {
        Alert.alert('Invalid Price', 'Enter a valid price to add as expense.');
        return;
      }
    }

    setPurchasing(true);
    try {
      await markGroceryPurchased(purchaseItem.item_id);
      setItems(prev =>
        prev.map(i => i.item_id === purchaseItem.item_id ? { ...i, is_purchased: true } : i)
      );

      if (convertToExpense) {
        const price = parseFloat(purchasePrice);
        const otherMembers = members.filter(m => m.id !== user.id);
        const totalPeople = otherMembers.length + 1; // others + current user
        const owedAmount = Math.round((price / totalPeople) * 100) / 100;
        const shares = otherMembers.map(m => ({ userId: m.id, owedAmount }));
        await createExpense({
          groupId,
          name: purchaseItem.name,
          price,
          category: purchaseItem.category || 'other',
          shares,
        });
      }

      setPurchaseModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to mark item as purchased');
    } finally {
      setPurchasing(false);
    }
  };

  // Derived lists
  const activeItems = items.filter(i => !i.is_purchased);
  const purchasedItems = items.filter(i => i.is_purchased);
  const filteredActive =
    filterCategory === 'all'
      ? activeItems
      : activeItems.filter(i => i.category === filterCategory);

  const CategoryBadge = ({ category }: { category: string }) => (
    <View style={[styles.catBadge, { backgroundColor: CATEGORY_BG[category] || CATEGORY_BG.other }]}>
      <Text style={[styles.catBadgeText, { color: CATEGORY_FG[category] || CATEGORY_FG.other }]}>
        {category}
      </Text>
    </View>
  );

  const renderActiveItem = ({ item }: { item: GroceryItem }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.category ? <CategoryBadge category={item.category} /> : null}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <Feather name="edit-2" size={15} color="#7D60A3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openPurchaseModal(item)}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.item_id)}>
          <Ionicons name="trash-outline" size={18} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Suggested Items */}
      {suggestions.length > 0 && (
        <View style={styles.suggSection}>
          <View style={styles.suggHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={15} color="#7D60A3" />
            <Text style={styles.suggTitle}>Suggested for You</Text>
          </View>
          {suggestions.map(s => (
            <View key={s.item} style={styles.suggRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggName}>{s.item}</Text>
                <Text style={styles.suggSub}>avg every {Math.round(s.avgDays)} days</Text>
              </View>
              <TouchableOpacity style={styles.addSuggBtn} onPress={() => handleAddSuggestion(s)}>
                <Feather name="plus" size={13} color="#7D60A3" />
                <Text style={styles.addSuggText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Shopping List header */}
      <View style={styles.listSectionHeader}>
        <MaterialCommunityIcons name="cart-outline" size={15} color="#14141A" />
        <Text style={styles.listSectionTitle}>Shopping List</Text>
        <Text style={styles.listSectionCount}>({filteredActive.length})</Text>
      </View>
    </View>
  );

  const ListFooter = () => {
    if (purchasedItems.length === 0) return null;
    return (
      <View style={styles.purchasedSection}>
        <View style={styles.listSectionHeader}>
          <Ionicons name="checkmark-circle" size={15} color="#2E7D32" />
          <Text style={[styles.listSectionTitle, { color: '#2E7D32' }]}>Purchased</Text>
          <Text style={styles.listSectionCount}>({purchasedItems.length})</Text>
        </View>
        {purchasedItems.map(item => (
          <View key={item.item_id} style={[styles.itemRow, styles.purchasedRow]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.purchasedName}>{item.name}</Text>
              {item.category ? <CategoryBadge category={item.category} /> : null}
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.item_id)}>
              <Ionicons name="trash-outline" size={18} color="#BDBDBD" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#14141A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grocery List</Text>
      </View>

      {/* Add Item Panel */}
      <View style={styles.addPanel}>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Add item..."
            placeholderTextColor="#8E8E93"
            value={newItemName}
            onChangeText={setNewItemName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={adding}>
            {adding
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="plus" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.addCatRow}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, newItemCategory === cat && styles.catChipActive]}
              onPress={() => setNewItemCategory(cat)}
            >
              <Text style={[styles.catChipText, newItemCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {['all', ...CATEGORIES].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
            onPress={() => setFilterCategory(cat)}
          >
            <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>
              {cat === 'all' ? 'All' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7D60A3" />
        </View>
      ) : (
        <FlatList
          data={filteredActive}
          keyExtractor={item => item.item_id.toString()}
          renderItem={renderActiveItem}
          ListHeaderComponent={<ListHeader />}
          ListFooterComponent={<ListFooter />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {filterCategory === 'all'
                  ? 'No items yet. Add something above!'
                  : `No ${filterCategory} items.`}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7D60A3"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Item name"
                placeholderTextColor="#8E8E93"
                autoFocus
              />
              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.addCatRow}
                style={{ marginBottom: 20 }}
              >
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, editCategory === cat && styles.catChipActive]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[styles.catChipText, editCategory === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveEdit} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.confirmBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Purchase Modal */}
      <Modal visible={purchaseModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Mark as Purchased</Text>
              <Text style={styles.modalItemName}>{purchaseItem?.name}</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Add as expense</Text>
                <Switch
                  value={convertToExpense}
                  onValueChange={setConvertToExpense}
                  trackColor={{ false: '#E4E3EE', true: '#7D60A3' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {convertToExpense && (
                <TextInput
                  style={styles.modalInput}
                  placeholder="Total price ($)"
                  placeholderTextColor="#8E8E93"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              )}

              {convertToExpense && members.length > 1 && (
                <Text style={styles.splitNote}>
                  Split evenly among {members.length} members
                </Text>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setPurchaseModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.confirmBtnText}>Confirm</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const BORDER = '#E4E3EE';
const CTA = '#7D60A3';
const QUICK_BG = '#E3E3F6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: QUICK_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
  },

  // Add panel
  addPanel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Inter',
    backgroundColor: '#F7F6FD',
    color: '#14141A',
  },
  addBtn: {
    marginLeft: 8,
    width: 42,
    height: 42,
    backgroundColor: CTA,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCatRow: {
    paddingBottom: 4,
    gap: 8,
    flexDirection: 'row',
  },

  // Category chips (for add + edit)
  catChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0EFF8',
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 6,
  },
  catChipActive: {
    backgroundColor: CTA,
    borderColor: CTA,
  },
  catChipText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },

  // Filter bar
  filterBar: {
    maxHeight: 40,
    marginBottom: 4,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F7F6FD',
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#14141A',
    borderColor: '#14141A',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Suggestions section
  suggSection: {
    backgroundColor: '#F7F6FD',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  suggHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  suggTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: CTA,
  },
  suggRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  suggName: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  suggSub: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8E93',
    marginTop: 2,
  },
  addSuggBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CTA,
  },
  addSuggText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: CTA,
  },

  // Section headers inside list
  listSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 6,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
  },
  listSectionCount: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#8E8E93',
  },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  itemName: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    marginBottom: 3,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },

  // Category badge
  catBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 2,
  },
  catBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Purchased section
  purchasedSection: {
    marginTop: 8,
  },
  purchasedRow: {
    opacity: 0.65,
  },
  purchasedName: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    marginBottom: 3,
  },

  // Empty state
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8E93',
    fontStyle: 'italic',
  },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginBottom: 4,
  },
  modalItemName: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    marginBottom: 8,
    marginTop: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter',
    backgroundColor: '#F7F6FD',
    color: '#14141A',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  splitNote: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#8E8E93',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: CTA,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
