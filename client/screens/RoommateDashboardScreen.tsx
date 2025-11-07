import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RoommateDashboardScreen() {
  const navigation = useNavigation();

  const notImplemented = (label: string) => Alert.alert(label, 'Coming soon');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color="#14141A" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.userName}>nomi user</Text>
          <Text style={styles.userSub}>Apartment 2106</Text>
        </View>
        <View style={styles.gearBtn}>
          <Ionicons name="settings-sharp" size={18} color="#14141A" />
        </View>
      </View>

      {/* Top stats */}
      <View style={styles.statHorizontalDividerTop} />
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$206</Text>
          <Text style={styles.statLabel}>Your balance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Chores To-Do</Text>
        </View>
      </View>
      <View style={styles.statHorizontalDivider} />
      {/* Quick actions - 2 x 2 grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => notImplemented('Add Expense')}>
          <View style={styles.quickIcon}>
            <Ionicons name="add" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('Fridge' as never)}>
          <View style={styles.quickIcon}>
            <MaterialCommunityIcons name="fridge" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Fridge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ChoreTracker' as never)}>
          <View style={styles.quickIcon}>
            <MaterialCommunityIcons name="iron" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Chores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('Rules' as never)}>
          <View style={styles.quickIcon}>
            <Feather name="list" size={20} color="#14141A" />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>Rules</Text>
        </TouchableOpacity>
      </View>

      {/* AI Suggestions */}
      <View style={styles.aiCard}>
        <View style={styles.aiHeaderRow}>
          <MaterialCommunityIcons name="robot" size={18} color="#14141A" style={{ marginRight: 6 }} />
          <Text style={styles.aiTitle}>AI Suggestions</Text>
        </View>
        <Text style={styles.aiText}>
          Based on your fridge, you can make pesto pasta today with roommate 1!
        </Text>
        <TouchableOpacity style={styles.aiButton} onPress={() => notImplemented('View recipe')}>
          <Text style={styles.aiButtonText}>view recipe</Text>
        </TouchableOpacity>
      </View>

      {/* Roommate Status */}
      <Text style={styles.sectionTitle}>Roommate Status</Text>
      <View style={styles.roommateCard}>
        <View style={styles.roommateRow}>
          <View style={styles.roommateAvatar}>
            <Ionicons name="person" size={18} color="#14141A" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.roommateName}>roommate 1</Text>
            <Text style={styles.roommateSub}>Available Now</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: '#33A852' }]} />
        </View>
      </View>
      <View style={styles.roommateCard}>
        <View style={styles.roommateRow}>
          <View style={styles.roommateAvatar}>
            <Ionicons name="person" size={18} color="#14141A" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.roommateName}>roommate 2</Text>
            <Text style={styles.roommateSub}>Busy</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: '#C9C9CF' }]} />
        </View>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityRow}>
          <View style={styles.activityIcon}>
            <MaterialCommunityIcons name="currency-usd" size={18} color="#14141A" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.activityText}>roommate 1 paid $45 for groceries</Text>
            <Text style={styles.activitySub}>2 hours ago</Text>
          </View>
        </View>
      </View>
      <View style={styles.activityCard}>
        <View style={styles.activityRow}>
          <View style={styles.activityIcon}>
            <Ionicons name="checkmark-done" size={18} color="#14141A" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.activityText}>roommate 2 added dishes to chores</Text>
            <Text style={styles.activitySub}>5 hours ago</Text>
          </View>
        </View>
      </View>

      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => notImplemented('Menu')}>
          <Feather name="menu" size={20} color="#14141A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => notImplemented('Grid')}>
          <Feather name="grid" size={20} color="#14141A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navHome} onPress={() => navigation.navigate('Start' as never)}>
          <Ionicons name="home" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => notImplemented('Profile')}>
          <Ionicons name="person-circle-outline" size={22} color="#14141A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => notImplemented('People')}>
          <Ionicons name="people-outline" size={22} color="#14141A" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 88,
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
    fontSize: 18,
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
    width: '46%',
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
  roommateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
  },
  roommateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roommateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7E6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roommateName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
  },
  roommateSub: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
    marginTop: 2,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navIcon: {
    fontSize: 20,
  },
  navHome: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#14141A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});


