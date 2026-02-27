import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser } from '../services/groupsService';
import { getExpensesByGroup, Expense, ExpenseShare } from '../services/expenseService';

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

  useEffect(() => {
    const loadExpenses = async () => {
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

        const groupId = groups[0].id;
        const expenses = await getExpensesByGroup(groupId);

        // Process expenses to get "Owed" and "You owe" items
        const owed: OwedItem[] = [];
        const youOwe: YouOweItem[] = [];

        expenses.forEach((expense: Expense) => {
          // "Owed" - expenses where current user paid, get shares (each share is a separate item)
          if (expense.paid_by_user_id === user.id && expense.shares) {
            expense.shares.forEach((share: ExpenseShare) => {
              const userName = share.first && share.last 
                ? `${share.first} ${share.last}` 
                : share.email?.split('@')[0] || 'Unknown';
              
              // Each share is a separate item in the list
              // Ensure amount is a number
              const amount = typeof share.owed_amount === 'string' 
                ? parseFloat(share.owed_amount) 
                : (share.owed_amount || 0);
              
              owed.push({
                expenseId: expense.expense_id,
                shareId: share.share_id,
                expenseName: expense.name,
                userName,
                amount,
              });
            });
          }

          // "You owe" - shares where current user is the one who owes
          if (expense.shares) {
            expense.shares.forEach((share: ExpenseShare) => {
              if (share.user_id === user.id) {
                const paidByName = expense.first && expense.last
                  ? `${expense.first} ${expense.last}`
                  : expense.email?.split('@')[0] || 'Unknown';
                
                // Ensure amount is a number
                const amount = typeof share.owed_amount === 'string' 
                  ? parseFloat(share.owed_amount) 
                  : (share.owed_amount || 0);
                
                youOwe.push({
                  expenseId: expense.expense_id,
                  expenseName: expense.name,
                  paidByName,
                  amount,
                });
              }
            });
          }
        });

        setOwedItems(owed);
        setYouOweItems(youOwe);
        setRecentTransactions(expenses.slice(0, 5)); // Show last 5 expenses as recent transactions
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.dollarSign}>$</Text>
        </View>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RoommateDashboard')} style={styles.dashboardButton}>
          <Ionicons name="home-outline" size={22} color="#14141A" />
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add a New Purchase Section */}
        <Text style={styles.sectionTitle}>Add a New Purchase:</Text>
        <View style={styles.addPurchaseRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ReceiptScanner')}
          >
            <Ionicons name="camera" size={24} color="#14141A" />
            <Text style={styles.addButtonText}>scan receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ManualEntry')}
          >
            <Feather name="file-text" size={24} color="#14141A" />
            <Text style={styles.addButtonText}>enter manually</Text>
          </TouchableOpacity>
        </View>

        {/* Owed Section - Each expense share item where current user is owed */}
        <Text style={styles.sectionTitle}>Owed</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7D60A3" />
        ) : owedItems.length > 0 ? (
          owedItems.map((item) => (
            <View key={`owed-${item.shareId}`} style={styles.pendingCard}>
              <View style={styles.pendingContent}>
                <Text style={styles.pendingText}>
                  {item.userName} owes you ${item.amount.toFixed(2)} for {item.expenseName}
                </Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No one owes you</Text>
        )}

        {/* You Owe Section - What the current user owes */}
        <Text style={styles.sectionTitle}>You owe:</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7D60A3" />
        ) : youOweItems.length > 0 ? (
          youOweItems.map((item, index) => (
            <View key={`youowe-${item.expenseId}-${index}`} style={styles.pendingCard}>
              <View style={styles.pendingContent}>
                <Text style={styles.pendingText}>
                  you owe {item.paidByName} ${item.amount.toFixed(2)} for {item.expenseName}
                </Text>
                <TouchableOpacity style={styles.payNowButton}>
                  <Text style={styles.payNowText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>You don't owe anyone</Text>
        )}

        {/* Recent Transactions Section */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7D60A3" />
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((expense: Expense) => {
            const paidByName = expense.first && expense.last
              ? `${expense.first} ${expense.last}`
              : expense.email?.split('@')[0] || 'Unknown';
            
            // Ensure price is a number
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
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dashboardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#14141A',
    marginBottom: 12,
  },
  addPurchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#14141A',
  },
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    marginRight: 12,
  },
  payNowButton: {
    backgroundColor: CTA,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CTA,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  transactionContent: {
    flex: 1,
  },
  transactionText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#8E8E93',
  },
});
