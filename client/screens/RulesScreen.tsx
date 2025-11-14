import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

type Rule = {
  id: string;
  text: string;
  addedDate?: string; // Optional for future backend integration
};

type RootStackParamList = {
  Rules: undefined;
  Dashboard: undefined;
  RoommateDashboard: undefined;
};

// Initial mock data
const getInitialMockRules = (): Rule[] => [
  { id: '1', text: 'No Smoking', addedDate: '2 days ago' },
  { id: '2', text: 'Separate Recyclables and Compost', addedDate: '2 days ago' },
  { id: '3', text: 'Wash Dishes within 2 hrs', addedDate: '5 days ago' },
];

export default function RulesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Rules'>>();
  const refRBSheet = useRef<any>(null);
  
  const [rules, setRules] = useState<Rule[]>(getInitialMockRules());
  const [newRuleText, setNewRuleText] = useState('');

  const handleAddRule = () => {
    if (!newRuleText.trim()) return;

    const newRule: Rule = {
      id: Date.now().toString(),
      text: newRuleText.trim(),
      addedDate: 'just now', // Placeholder - can be replaced with actual date from backend
    };

    setRules([newRule, ...rules]); // Add new rule at the top
    setNewRuleText('');
    refRBSheet.current?.close();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('RoommateDashboard' as never)}>
          <Ionicons name="arrow-back" size={20} color="#14141A" />
          <Text style={styles.headerTitle}>Roommate Rules</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add New Rule Section */}
        <View style={styles.addRuleSection}>
          <Text style={styles.addRuleSectionTitle}>Add New Rule</Text>
          <TouchableOpacity
            style={styles.addRuleButton}
            onPress={() => refRBSheet.current?.open()}
          >
            <Text style={styles.addRuleButtonText}>+ Add Rule</Text>
          </TouchableOpacity>
        </View>

        {/* Current Rules Section */}
        <Text style={styles.sectionTitle}>Current Rules</Text>
        <View style={styles.rulesList}>
          {rules.map((rule) => (
            <View key={rule.id} style={styles.ruleCard}>
              <Text style={styles.ruleText}>{rule.text}</Text>
              <Text style={styles.ruleAddedDate}>
                Added {rule.addedDate || 'recently'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Rule Bottom Sheet */}
      <RBSheet
        ref={refRBSheet}
        useNativeDriver={false}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
          container: {
            height: 300,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          },
        }}
        customModalProps={{
          animationType: 'slide',
          statusBarTranslucent: true,
        }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Rule</Text>
          
          <Text style={styles.inputLabel}>Rule</Text>
          <TextInput
            placeholder="Enter rule text"
            placeholderTextColor="#999999"
            value={newRuleText}
            onChangeText={setNewRuleText}
            style={styles.input}
            multiline
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleAddRule}>
            <Text style={styles.saveButtonText}>Add Rule</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
}

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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addRuleSection: {
    backgroundColor: '#C9C9EE',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  addRuleSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  addRuleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addRuleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7D60A3',
    fontFamily: 'Inter',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  rulesList: {
    marginBottom: 100,
  },
  ruleCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 6,
  },
  ruleAddedDate: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#000000',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#C9C9EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

