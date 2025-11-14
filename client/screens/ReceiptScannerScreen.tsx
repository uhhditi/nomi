import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Expenses: undefined;
  ReceiptScanner: undefined;
  ReceiptReview: { items: Array<{ name: string; quantity: number; price: number }> };
};

export default function ReceiptScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ReceiptScanner'>>();

  const handleScan = () => {
    // TODO: Implement actual camera scanning
    // For now, simulate detected items
    const mockItems = [
      { name: 'salad mix', quantity: 1, price: 15.00 },
      { name: 'eggs', quantity: 1, price: 6.50 },
      { name: 'bananas', quantity: 1, price: 3.00 },
    ];
    navigation.navigate('ReceiptReview', { items: mockItems });
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

      <View style={styles.content}>
        <Text style={styles.scanText}>Scan Below:</Text>
        
        {/* Camera View Area */}
        <View style={styles.cameraArea}>
          <Ionicons name="camera" size={48} color="#FFFFFF" />
        </View>

        {/* Shutter Button */}
        <TouchableOpacity style={styles.shutterButton} onPress={handleScan}>
          <View style={styles.shutterInner} />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#14141A',
    marginBottom: 20,
  },
  cameraArea: {
    flex: 1,
    backgroundColor: CTA,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    minHeight: 400,
  },
  shutterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 40,
  },
  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E4E3EE',
  },
});

