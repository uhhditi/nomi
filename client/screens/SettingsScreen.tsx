import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { listGroupsForUser, leaveGroup } from '../services/groupsService';

type RootStackParamList = {
  RoommateDashboard: undefined;
  Start: undefined;
  Login: undefined;
  Settings: undefined;
  NomiStart: undefined;
  JoinOrCreateGroup: undefined;
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Settings'>>();
  const { user, logout, updateUser } = useAuth();
  const [groupInfo, setGroupInfo] = useState<{ id: number; name: string } | null>(null);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first || '');
  const [lastName, setLastName] = useState(user?.last || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (!user?.id) return;
      try {
        const groups = await listGroupsForUser(user.id);
        if (groups.length > 0) setGroupInfo(groups[0]);
      } catch (error) {
        console.error('Error loading group:', error);
      }
    };
    loadGroup();
  }, [user?.id]);

  const handleEditToggle = () => {
    setFirstName(user?.first || '');
    setLastName(user?.last || '');
    setEmail(user?.email || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({ first: firstName.trim(), last: lastName.trim(), email: email.trim() });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveGroup = () => {
    if (!groupInfo) { Alert.alert('Error', 'No group found'); return; }
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will need to be invited again to rejoin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupInfo.id);
              Alert.alert('Success', 'You have left the group', [
                { text: 'OK', onPress: () => navigation.navigate('JoinOrCreateGroup' as never) }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave group. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => { await logout(); navigation.navigate('NomiStart'); },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14141A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        {editing ? (
          <TouchableOpacity style={styles.editBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#3F3F96" /> : <Text style={styles.editBtnText}>Save</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={handleEditToggle}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Text style={styles.label}>First Name</Text>
              {editing ? (
                <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} autoCapitalize="words" autoCorrect={false} />
              ) : (
                <Text style={styles.value}>{user?.first || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.profileRow}>
              <Text style={styles.label}>Last Name</Text>
              {editing ? (
                <TextInput style={styles.input} value={lastName} onChangeText={setLastName} autoCapitalize="words" autoCorrect={false} />
              ) : (
                <Text style={styles.value}>{user?.last || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.profileRow}>
              <Text style={styles.label}>Email</Text>
              {editing ? (
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              ) : (
                <Text style={styles.value}>{user?.email || 'Not set'}</Text>
              )}
            </View>
          </View>
          {editing && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLeaveGroup}>
            <Text style={styles.actionButtonText}>Leave Group</Text>
            <Ionicons name="chevron-forward" size={20} color="#14141A" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
            <Text style={[styles.actionButtonText, styles.signOutButtonText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const BORDER = '#E4E3EE';
const CTA = '#3F3F96';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', fontFamily: 'Inter', color: '#14141A' },
  editBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EAEAF4' },
  editBtnText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: CTA },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'Inter', color: '#14141A', marginBottom: 12 },
  profileCard: { backgroundColor: '#F7F6FD', borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 16 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontSize: 16, fontFamily: 'Inter', fontWeight: '500', color: '#4A4A55' },
  value: { fontSize: 16, fontFamily: 'Inter', fontWeight: '600', color: '#14141A' },
  input: {
    fontSize: 15, fontFamily: 'Inter', fontWeight: '500', color: '#14141A',
    borderBottomWidth: 1, borderBottomColor: CTA,
    minWidth: 160, textAlign: 'right', paddingVertical: 2,
  },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 2 },
  cancelBtn: { marginTop: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontFamily: 'Inter', fontWeight: '500', color: '#8E8E93' },
  actionButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F7F6FD', borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 16,
  },
  actionButtonText: { fontSize: 16, fontFamily: 'Inter', fontWeight: '600', color: '#14141A' },
  signOutButton: { backgroundColor: '#FFE5E5', borderColor: '#FFB3B3' },
  signOutButtonText: { color: '#D32F2F' },
});

