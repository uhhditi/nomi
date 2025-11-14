import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function ExpensesScreen() {
  type PendingPayment = {
    roommate: string;
    amount: number;
    description: string;
    id: number;
  };

  type Transaction = {
    payer: string;
    payee: string;
    amount: number;
    description: string;
    timestamp: string;
  };

  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([
    { id: 1, roommate: 'rm 2', amount: 12.45, description: 'eggs' }
  ]);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([
    {
      payer: 'rm 1',
      payee: 'you',
      amount: 45,
      description: 'groceries',
      timestamp: '20 min ago'
    },
    {
      payer: 'rm 4',
      payee: 'rm 3',
      amount: 12,
      description: 'coffee',
      timestamp: '5 hours ago'
    },
    {
      payer: 'you',
      payee: 'rm 2',
      amount: 19,
      description: 'tickets!',
      timestamp: '2 days ago'
    }
  ]);

  type RootStackParamList = {
    Expenses: undefined;
    ReceiptScan: undefined;
    ManualEntry: undefined;
  };

  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
  }

  const { user } = auth;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Expenses'>>();

  const handlePayNow = (paymentId: number) => {
    // Handle payment logic
    console.log('Processing payment:', paymentId);
  };

  const handleRemovePayment = (paymentId: number) => {
    setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
            <Ionicons name="cash" size={20} color="white" />
          </View>
          <Text className="text-2xl font-bold">Expenses</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Add New Purchase */}
        <Text className="text-lg font-semibold mb-4">Add a New Purchase:</Text>
        
        <View className="flex-row mb-8">
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-2xl p-6 items-center justify-center mr-3"
            onPress={() => navigation.navigate('ReceiptScan')}
          >
            <Ionicons name="camera" size={40} color="black" />
            <Text className="text-sm mt-2 text-gray-700">scan receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-2xl p-6 items-center justify-center ml-3"
            onPress={() => navigation.navigate('ManualEntry')}
          >
            <Ionicons name="document-text" size={40} color="black" />
            <Text className="text-sm mt-2 text-gray-700">enter manually</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Payments */}
        <Text className="text-lg font-semibold mb-4">Pending</Text>

        {pendingPayments.length > 0 ? (
          <View className="mb-6">
            {pendingPayments.map((payment) => (
              <View key={payment.id} className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base">
                    <Text className="font-semibold">you owe {payment.roommate}</Text>
                    {' '}${payment.amount.toFixed(2)} for {payment.description}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="bg-indigo-500 rounded-lg px-4 py-2 mr-2"
                    onPress={() => handlePayNow(payment.id)}
                  >
                    <Text className="text-white font-semibold text-sm">Pay Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full border-2 border-red-500 items-center justify-center"
                    onPress={() => handleRemovePayment(payment.id)}
                  >
                    <Ionicons name="close" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-xl p-6 mb-6 items-center">
            <Text className="text-gray-500">No more pending payments</Text>
          </View>
        )}

        {/* Recent Transactions */}
        <Text className="text-lg font-semibold mb-4">Recent Transactions</Text>

        <View className="mb-6">
          {recentTransactions.map((transaction, index) => (
            <View key={index} className="bg-white rounded-xl p-4 mb-3 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
                <Ionicons name="cash" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base">
                  <Text className="font-semibold">{transaction.payer} paid {transaction.payee}</Text>
                  {' '}${transaction.amount} for {transaction.description}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">{transaction.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 flex-row items-center justify-around py-4">
        <TouchableOpacity className="items-center">
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="receipt" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="person" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="people" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}