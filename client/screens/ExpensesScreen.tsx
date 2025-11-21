import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Expenses: undefined;
  ReceiptScanner: undefined;
  ManualEntry: undefined;
  RoommateDashboard: undefined;
};

export default function ExpensesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Expenses'>>();

  // Mock data - replace with actual data from API
  const pendingPayments = [
    { id: '1', from: 'rm 2', amount: 12.45, description: 'eggs' },
  ];

  const recentTransactions = [
    { id: '1', type: 'received', from: 'rm 1', amount: 45, description: 'groceries', time: '20 min ago' },
    { id: '2', type: 'other', from: 'rm 4', to: 'rm 3', amount: 12, description: 'coffee', time: '5 hours ago' },
    { id: '3', type: 'paid', to: 'rm 2', amount: 19, description: 'tickets', time: '2 days ago' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.dollarSign}>$</Text>
        </View>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => {}}>
          <Feather name="menu" size={20} color="#14141A" />
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

        {/* Pending Section */}
        <Text style={styles.sectionTitle}>Pending</Text>
        {pendingPayments.length > 0 ? (
          pendingPayments.map((payment) => (
            <View key={payment.id} style={styles.pendingCard}>
              <View style={styles.pendingContent}>
                <Text style={styles.pendingText}>
                  you owe {payment.from} ${payment.amount.toFixed(2)} for {payment.description}
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
        ) : null}
        {pendingPayments.length === 0 && (
          <Text style={styles.emptyText}>No more pending payments</Text>
        )}

        {/* Recent Transactions Section */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionDollarSign}>$</Text>
            </View>
            <View style={styles.transactionContent}>
              <Text style={styles.transactionText}>
                {transaction.type === 'received' && `${transaction.from} paid you $${transaction.amount} for ${transaction.description}`}
                {transaction.type === 'paid' && `you paid ${transaction.to} $${transaction.amount} for ${transaction.description}!`}
                {transaction.type === 'other' && `${transaction.from} paid ${transaction.to} $${transaction.amount} for ${transaction.description}`}
              </Text>
              <Text style={styles.transactionTime}>{transaction.time}</Text>
            </View>
          </View>
        ))}
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
    paddingBottom: 88,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginTop: 20,
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
  navHome: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#14141A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
