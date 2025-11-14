import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FridgeScreen() {
  const onItemPress = (label: string) => Alert.alert('Fridge', `${label} tapped`);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('RoommateDashboard' as never)}>
          <Ionicons name="arrow-back" size={20} color="#14141A" />
          <Text style={styles.headerTitle}>Smart Fridge</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Card container */}
        <View style={styles.panel}>
          {/* Freezer */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="fridge-industrial" size={16} color="#14141A" />
            <Text style={styles.sectionTitle}>Freezer</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Ice')}>
              <MaterialCommunityIcons name="ice-pop" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Ice cream')}>
              <MaterialCommunityIcons name="ice-cream" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Frozen soup')}>
              <MaterialCommunityIcons name="pot-steam-outline" size={28} color="#14141A" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Dairy */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="cow" size={16} color="#14141A" />
            <Text style={styles.sectionTitle}>Dairy</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Milk')}>
              <MaterialCommunityIcons name="bottle-soda-outline" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Yogurt')}>
              <MaterialCommunityIcons name="cup-outline" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Cheese')}>
              <MaterialCommunityIcons name="cheese" size={28} color="#14141A" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Produce */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="fruit-grapes-outline" size={16} color="#14141A" />
            <Text style={styles.sectionTitle}>Produce</Text>
          </View>
          {/* Row of 2 (side-by-side large cards) */}
          <View style={styles.rowBetween}>
            <TouchableOpacity style={[styles.item, styles.itemWide]} onPress={() => onItemPress('Carrot')}>
              <MaterialCommunityIcons name="carrot" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.item, styles.itemWide]} onPress={() => onItemPress('Broccoli')}>
              <MaterialCommunityIcons name="food-apple-outline" size={28} color="#14141A" />
            </TouchableOpacity>
          </View>
          {/* Row of 3 */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Mushroom')}>
              <MaterialCommunityIcons name="mushroom-outline" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Olives')}>
              <MaterialCommunityIcons name="food-outline" size={28} color="#14141A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => onItemPress('Pineapple')}>
              <MaterialCommunityIcons name="pineapple" size={28} color="#14141A" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Misc */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#14141A" />
            <Text style={styles.sectionTitle}>Misc</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.item, styles.itemFull]} onPress={() => onItemPress('Bread')}>
              <MaterialCommunityIcons name="bread-slice-outline" size={28} color="#14141A" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_BG = '#C9C9EE';
const BORDER = '#E4E3EE';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 72,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#14141A',
  },
  panel: {
    backgroundColor: '#F7F6FD',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#14141A',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  item: {
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    width: 96,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemWide: {
    width: '48%',
  },
  itemFull: {
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },
});


