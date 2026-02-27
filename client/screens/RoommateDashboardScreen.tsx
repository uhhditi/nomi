import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser, listMembers } from '../services/groupsService';
import { getChores, Chore } from '../services/choreService';
import { getExpensesByGroup, Expense } from '../services/expenseService';

export default function RoommateDashboardScreen() {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const [groupInfo, setGroupInfo] = useState<{ id: number; name: string } | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [recentChore, setRecentChore] = useState<Chore | null>(null);
  const [choresToDoCount, setChoresToDoCount] = useState(0);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwedToYou, setTotalOwedToYou] = useState(0);
  const [recentExpense, setRecentExpense] = useState<Expense | null>(null);

  const notImplemented = (label: string) => Alert.alert(label, 'Coming soon');

  // Format relative time (e.g., "2 hours ago", "3 days ago")
  const formatRelativeTime = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'Unknown time';
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    return `${Math.floor(diffDays / 365)} ${Math.floor(diffDays / 365) === 1 ? 'year' : 'years'} ago`;
  };

  // Format due date (e.g., "Jan 15, 2024")
  const formatDueDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'No due date';
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Load group info, recent chores, and expenses
  const loadGroupInfo = async () => {
    if (!user?.id) return;
    
    try {
      const groups = await listGroupsForUser(user.id);
      if (groups.length > 0) {
        const group = groups[0];
        setGroupInfo(group);
        
        // Load member count
        const members = await listMembers(group.id);
        setMemberCount(members.length);

        // Load most recent chore and count incomplete chores
        try {
          const chores = await getChores(group.id);
          // Sort by created_at DESC and take the most recent one
          const sortedChores = chores
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setRecentChore(sortedChores.length > 0 ? sortedChores[0] : null);
          
          // Count incomplete chores (where completed = false)
          const incompleteChores = chores.filter(chore => !chore.completed);
          setChoresToDoCount(incompleteChores.length);
        } catch (error) {
          console.error('Error loading recent chore:', error);
        }

        // Load expenses to calculate total owed and get most recent expense
        try {
          const expenses = await getExpensesByGroup(group.id);

          // Calculate total amount user owes (shares where this user is the debtor)
          // and total amount owed to user (shares on expenses they paid for)
          let total = 0;
          let totalToYou = 0;
          expenses.forEach((expense: Expense) => {
            if (expense.shares) {
              expense.shares.forEach((share) => {
                const amount = typeof share.owed_amount === 'string'
                  ? parseFloat(share.owed_amount)
                  : (share.owed_amount || 0);
                // eslint-disable-next-line eqeqeq
                if (share.user_id == user.id) {
                  total += amount;
                }
                // eslint-disable-next-line eqeqeq
                if (expense.paid_by_user_id == user.id) {
                  totalToYou += amount;
                }
              });
            }
          });
          setTotalOwed(Math.round(total * 100) / 100);
          setTotalOwedToYou(Math.round(totalToYou * 100) / 100);

          // Get most recent expense (sorted by created_at DESC)
          const sortedExpenses = expenses
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            });
          
          setRecentExpense(sortedExpenses.length > 0 ? sortedExpenses[0] : null);
        } catch (error) {
          console.error('Error loading expenses:', error);
        }
      }
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  useEffect(() => {
    loadGroupInfo();
  }, [user?.id]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadGroupInfo();
      }
    }, [user?.id])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color="#14141A" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.userName}>
            {user?.first || 'nomi'} {user?.last || 'user'}
          </Text>
        </View>
        <TouchableOpacity style={styles.gearBtn} onPress={() => navigation.navigate('Settings' as never)}>
          <Ionicons name="settings-sharp" size={18} color="#14141A" />
        </TouchableOpacity>
      </View>

      {/* Group Section */}
      {groupInfo && (
        <TouchableOpacity 
          style={styles.groupSection}
          onPress={() => navigation.navigate('ManageGroup' as never)}
        >
          <Text style={styles.groupName}>{groupInfo.name}</Text>
          <Ionicons name="people" size={24} color="#14141A" />
        </TouchableOpacity>
      )}

      {/* Top stats */}
      <View style={styles.statHorizontalDividerTop} />
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${totalOwed.toFixed(2)}</Text>
          <Text style={styles.statLabel}>You owe</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${totalOwedToYou.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Owed to you</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{choresToDoCount}</Text>
          <Text style={styles.statLabel}>Chores</Text>
        </View>
      </View>
      <View style={styles.statHorizontalDivider} />
      {/* Quick actions - 2 x 2 grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('Expenses' as never)}>
          <View style={styles.quickIcon}>
            <Ionicons name="add" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('GroceryList' as never)}>
          <View style={styles.quickIcon}>
            <MaterialCommunityIcons name="cart-outline" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Grocery List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ChoreTracker' as never)}>
          <View style={styles.quickIcon}>
            <MaterialCommunityIcons name="iron" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Chores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => Alert.alert('Feature Coming Soon', 'This feature is coming soon!')}>
          <View style={styles.quickIcon}>
            <Feather name="list" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Rules</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {(() => {
        // Determine which is more recent: expense or chore
        const expenseTime = recentExpense?.created_at ? new Date(recentExpense.created_at).getTime() : 0;
        const choreTime = recentChore?.createdAt ? new Date(recentChore.createdAt).getTime() : 0;
        const showExpense = expenseTime >= choreTime && recentExpense;
        const showChore = choreTime > expenseTime && recentChore;

        if (showExpense) {
          const paidByName = recentExpense.first && recentExpense.last
            ? `${recentExpense.first} ${recentExpense.last}`
            : recentExpense.email?.split('@')[0] || 'Someone';
          
          return (
            <View style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="cash" size={18} color="#14141A" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activityText}>
                    {paidByName} added {recentExpense.name}
                  </Text>
                  <Text style={styles.activitySub}>
                    {formatRelativeTime(recentExpense.created_at)}
                  </Text>
                </View>
              </View>
            </View>
          );
        } else if (showChore) {
          return (
            <View style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-done" size={18} color="#14141A" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activityText}>
                    {recentChore.title} by {formatDueDate(recentChore.dueDate)}
                  </Text>
                  <Text style={styles.activitySub}>
                    {formatRelativeTime(recentChore.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        } else {
          return (
            <View style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-done" size={18} color="#14141A" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activityText}>No recent activity</Text>
                  <Text style={styles.activitySub}>Create an expense or chore to see activity</Text>
                </View>
              </View>
            </View>
          );
        }
      })()}

      </ScrollView>
    </View>
  );
}

const CARD_BG = '#C9C9EE';
const QUICK_BG = '#E3E3F6';
const LAVENDER = 'rgba(107,107,255,0.7)';
const BORDER = '#E4E3EE';
const CTA = '#3F3F96';
const STAT_BG = 'rgba(107,107,255,0.25)';
const STAT_BORDER = '#6B6BFF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAEAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#111',
  },
  userSub: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#444',
    marginTop: 2,
  },
  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  statCard: {
    width: '30%',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowOpacity: 0,
    marginBottom: 0,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: CTA,
  },
  statBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: CTA,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#D7D7EA',
  },
  statHorizontalDivider: {
    height: 1,
    backgroundColor: '#D7D7EA',
    marginTop: 4,
    marginBottom: 6,
  },
  statHorizontalDividerTop: {
    height: 1,
    backgroundColor: '#D7D7EA',
    marginBottom: 6,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickCard: {
    width: '48%',
    backgroundColor: QUICK_BG,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  quickIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#2E2E37',
  },
  aiCard: {
    backgroundColor: LAVENDER,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiBot: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#2E2E37',
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
  },
  aiText: {
    color: '#14141A',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  aiButton: {
    alignSelf: 'flex-start',
    backgroundColor: CTA,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginTop: 16,
    marginBottom: 8,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EDEAF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#14141A',
  },
  activitySub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
  },
  groupSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: QUICK_BG,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    flex: 1,
  },
});


