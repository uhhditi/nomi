import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser } from '../services/groupsService';
import { getExpensesByGroup, markSharesPaid, Expense, ExpenseShare } from '../services/expenseService';

type RootStackParamList = {
  Expenses: undefined;
  ReceiptScanner: undefined;
  ManualEntry: undefined;
  RoommateDashboard: undefined;
};

interface OwedItem {
  expenseId: number;
  shareId: number;
  expenseName: string;
  userName: string;
  amount: number;
}

interface YouOweItem {
  expenseId: number;
  shareId: number;
  expenseName: string;
  paidByName: string;
  amount: number;
}

export default function ExpensesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Expenses'>>();
  const auth = useContext(AuthContext);
  const { user } = auth || {};

  const [loading, setLoading] = useState(true);
  const [owedItems, setOwedItems] = useState<OwedItem[]>([]);
  const [youOweItems, setYouOweItems] = useState<YouOweItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const processExpenses = (expenses: Expense[], userId: number) => {
    const owed: OwedItem[] = [];
    const youOwe: YouOweItem[] = [];
    expenses.forEach((expense: Expense) => {
      // eslint-disable-next-line eqeqeq
      if (expense.paid_by_user_id == userId && expense.shares) {
        expense.shares.forEach((share: ExpenseShare) => {
          const userName = share.first && share.last ? `${share.first} ${share.last}` : share.email?.split('@')[0] || 'Unknown';
          const amount = typeof share.owed_amount === 'string' ? parseFloat(share.owed_amount) : (share.owed_amount || 0);
          owed.push({ expenseId: expense.expense_id, shareId: share.share_id, expenseName: expense.name, userName, amount });
        });
      }
      if (expense.shares) {
        expense.shares.forEach((share: ExpenseShare) => {
          // eslint-disable-next-line eqeqeq
          if (share.user_id == userId) {
            const paidByName = expense.first && expense.last ? `${expense.first} ${expense.last}` : expense.email?.split('@')[0] || 'Unknown';
            const amount = typeof share.owed_amount === 'string' ? parseFloat(share.owed_amount) : (share.owed_amount || 0);
            youOwe.push({ expenseId: expense.expense_id, shareId: share.share_id, expenseName: expense.name, paidByName, amount });
          }
        });
      }
    });
    return { owed, youOwe };
  };

  useEffect(() => {
    const loadExpenses = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const groups = await listGroupsForUser(user.id);
        if (groups.length === 0) { setLoading(false); return; }
        const expenses = await getExpensesByGroup(groups[0].id);
        const { owed, youOwe } = processExpenses(expenses, user.id);
        setOwedItems(owed);
        setYouOweItems(youOwe);
        setRecentTransactions(expenses.slice(0, 5));
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        setLoading(true);
        const loadExpenses = async () => {
          try {
            const groups = await listGroupsForUser(user.id);
            if (groups.length === 0) { setLoading(false); return; }
            const expenses = await getExpensesByGroup(groups[0].id);
            const { owed, youOwe } = processExpenses(expenses, user.id);
            setOwedItems(owed);
            setYouOweItems(youOwe);
            setRecentTransactions(expenses.slice(0, 5));
          } catch (error) {
            console.error('Error loading expenses:', error);
          } finally {
            setLoading(false);
          }
        };
        loadExpenses();
      }
    }, [user?.id])
  );

  // Aggregate per-person totals and collect shareIds
  const owedByPerson: Record<string, number> = {};
  const owedShareIdsByPerson: Record<string, number[]> = {};
  owedItems.forEach(item => {
    owedByPerson[item.userName] = (owedByPerson[item.userName] || 0) + item.amount;
    owedShareIdsByPerson[item.userName] = [...(owedShareIdsByPerson[item.userName] || []), item.shareId];
  });

  const youOweByPerson: Record<string, number> = {};
  const youOweShareIdsByPerson: Record<string, number[]> = {};
  youOweItems.forEach(item => {
    youOweByPerson[item.paidByName] = (youOweByPerson[item.paidByName] || 0) + item.amount;
    youOweShareIdsByPerson[item.paidByName] = [...(youOweShareIdsByPerson[item.paidByName] || []), item.shareId];
  });

  const handleMarkSettled = (name: string, shareIds: number[]) => {
    Alert.alert(
      'Mark Settled',
      `Mark ${name}'s balance as settled?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Settled',
          onPress: async () => {
            try {
              await markSharesPaid(shareIds);
              setOwedItems(prev => prev.filter(item => !shareIds.includes(item.shareId)));
            } catch {
              Alert.alert('Error', 'Failed to mark as settled. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleMarkPaid = (name: string, shareIds: number[]) => {
    Alert.alert(
      'Mark Paid',
      `Mark your balance with ${name} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            try {
              await markSharesPaid(shareIds);
              setYouOweItems(prev => prev.filter(item => !shareIds.includes(item.shareId)));
            } catch {
              Alert.alert('Error', 'Failed to mark as paid. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.dollarSign}>$</Text>
        </View>
        <Text style={styles.headerTitle}>Expenses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add a New Purchase */}
        <Text style={styles.sectionTitle}>Add a New Purchase:</Text>
        <View style={styles.addPurchaseRow}>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ReceiptScanner')}>
            <Ionicons name="camera" size={24} color="#14141A" />
            <Text style={styles.addButtonText}>scan receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ManualEntry')}>
            <Feather name="file-text" size={24} color="#14141A" />
            <Text style={styles.addButtonText}>enter manually</Text>
          </TouchableOpacity>
        </View>

        {/* Owed to you — green */}
        <Text style={styles.sectionTitle}>Owed to you</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7D60A3" />
        ) : Object.keys(owedByPerson).length > 0 ? (
          Object.entries(owedByPerson).map(([name, total]) => (
            <View key={`owed-${name}`} style={styles.greenCard}>
              <View style={styles.personRow}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personInitial}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{name}</Text>
                  <Text style={styles.personSub}>owes you</Text>
                </View>
                <Text style={styles.greenAmount}>${total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.settleButton}
                onPress={() => handleMarkSettled(name, owedShareIdsByPerson[name])}
              >
                <Text style={styles.settleButtonText}>Mark Settled</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No one owes you right now</Text>
        )}

        {/* You owe — red */}
        <Text style={styles.sectionTitle}>You owe</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7D60A3" />
        ) : Object.keys(youOweByPerson).length > 0 ? (
          Object.entries(youOweByPerson).map(([name, total]) => (
            <View key={`youowe-${name}`} style={styles.redCard}>
              <View style={styles.personRow}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personInitial}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{name}</Text>
                  <Text style={styles.personSub}>you owe</Text>
                </View>
                <Text style={styles.redAmount}>${total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.paidButton}
                onPress={() => handleMarkPaid(name, youOweShareIdsByPerson[name])}
              >
                <Text style={styles.paidButtonText}>Mark Paid</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>You don't owe anyone</Text>
        )}

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7D60A3" />
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((expense: Expense) => {
            const paidByName = expense.first && expense.last
              ? `${expense.first} ${expense.last}`
              : expense.email?.split('@')[0] || 'Unknown';
            const price = typeof expense.price === 'string'
              ? parseFloat(expense.price)
              : (expense.price || 0);
            return (
              <View key={expense.expense_id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionDollarSign}>$</Text>
                </View>
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionText}>
                    {paidByName} paid ${price.toFixed(2)} for {expense.name}
                  </Text>
                  <Text style={styles.transactionTime}>
                    {new Date(expense.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => {}}>
          <Feather name="menu" size={20} color="#14141A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Feather name="grid" size={20} color="#14141A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navHome} onPress={() => navigation.navigate('RoommateDashboard')}>
          <Ionicons name="home" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="person-circle-outline" size={22} color="#14141A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="people-outline" size={22} color="#14141A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BORDER = '#E4E3EE';
const CTA = '#7D60A3';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 56 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    marginRight: 12, borderWidth: 1, borderColor: BORDER,
  },
  dollarSign: { fontSize: 18, fontWeight: '600', color: '#14141A', fontFamily: 'Inter' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '600', color: '#14141A', fontFamily: 'Inter' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 88 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#14141A',
    marginTop: 20, marginBottom: 12,
  },
  addPurchaseRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  addButton: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 10,
    borderWidth: 1, borderColor: BORDER, paddingVertical: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  addButtonText: { marginTop: 8, fontSize: 13, fontWeight: '500', fontFamily: 'Inter', color: '#14141A' },
  // Green card — owed to you
  greenCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    padding: 14,
    marginBottom: 10,
  },
  greenAmount: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#2E7D32' },
  settleButton: {
    marginTop: 10, alignSelf: 'flex-end',
    paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: 6, backgroundColor: '#2E7D32',
  },
  settleButtonText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter', color: '#FFFFFF' },
  // Red card — you owe
  redCard: {
    backgroundColor: '#FFE5E5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFB3B3',
    padding: 14,
    marginBottom: 10,
  },
  redAmount: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#D32F2F' },
  paidButton: {
    marginTop: 10, alignSelf: 'flex-end',
    paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: 6, backgroundColor: '#D32F2F',
  },
  paidButtonText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter', color: '#FFFFFF' },
  // Shared person row
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EAEAF4', alignItems: 'center', justifyContent: 'center',
  },
  personInitial: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#3F3F96' },
  personName: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter', color: '#14141A' },
  personSub: { fontSize: 12, fontWeight: '400', fontFamily: 'Inter', color: '#6B7280', marginTop: 1 },
  emptyText: {
    fontSize: 13, fontFamily: 'Inter', fontWeight: '400',
    color: '#8E8E93', fontStyle: 'italic', marginBottom: 8,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: BORDER, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center',
  },
  transactionIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: CTA,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  transactionDollarSign: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', fontFamily: 'Inter' },
  transactionContent: { flex: 1 },
  transactionText: { fontSize: 14, fontFamily: 'Inter', fontWeight: '500', color: '#14141A', marginBottom: 4 },
  transactionTime: { fontSize: 12, fontFamily: 'Inter', fontWeight: '400', color: '#8E8E93' },
  bottomBar: {
    position: 'absolute', bottom: 8, left: 0, right: 0, height: 64,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER,
    paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  navHome: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#14141A', alignItems: 'center', justifyContent: 'center',
  },
});
