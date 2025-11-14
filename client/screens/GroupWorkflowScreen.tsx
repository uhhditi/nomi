import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  CreateGroup: undefined;
  RoommateDashboard: undefined;
  GroupWorkflow: undefined;
};

export default function GroupWorkflowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'GroupWorkflow'>>();

  // TODO: Replace with actual invitations data from API/context
  const invitations = [
    { id: '1', groupName: 'Apartment 2106', inviterName: 'John Doe' },
    { id: '2', groupName: 'House Share', inviterName: 'Jane Smith' },
  ];

  const handleAcceptInvitation = (invitationId: string) => {
    Alert.alert('Success', 'You have joined the group!');
    // TODO: Implement accept invitation API call
    console.log('Accept invitation:', invitationId);
  };

  const handleDenyInvitation = (invitationId: string) => {
    Alert.alert('Invitation Declined', 'You have declined the invitation.');
    // TODO: Implement deny invitation API call
    console.log('Deny invitation:', invitationId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join or Create Group</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Group Invitations Section */}
        <Text style={styles.sectionTitle}>Group Invitations</Text>
        
        {invitations.length > 0 ? (
          invitations.map((invitation) => (
            <View key={invitation.id} style={styles.invitationCard}>
              <View style={styles.invitationContent}>
                <View style={styles.invitationIcon}>
                  <Ionicons name="mail" size={18} color="#14141A" />
                </View>
                <View style={styles.invitationText}>
                  <Text style={styles.invitationGroupName}>{invitation.groupName}</Text>
                  <Text style={styles.invitationInviter}>Invited by {invitation.inviterName}</Text>
                </View>
              </View>
              <View style={styles.invitationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptInvitation(invitation.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.denyButton]}
                  onPress={() => handleDenyInvitation(invitation.id)}
                >
                  <Text style={styles.denyButtonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={32} color="#4A4A55" />
            <Text style={styles.emptyStateText}>No invitations</Text>
          </View>
        )}

        {/* Create Group Section */}
        <Text style={styles.sectionTitle}>Create Group</Text>
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <View style={styles.createGroupContent}>
            <Ionicons name="add" size={20} color="#14141A" />
            <Text style={styles.createGroupText}>Create Group</Text>
          </View>
        </TouchableOpacity>

        {/* Go to Dashboard Button */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('RoommateDashboard')}
        >
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const CARD_BG = '#C9C9EE';
const QUICK_BG = '#E3E3F6';
const BORDER = '#E4E3EE';
const CTA = '#3F3F96';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
    fontFamily: 'Inter',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
  },
  headerSpacer: {
    width: 24,
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
    marginTop: 16,
    marginBottom: 8,
  },
  invitationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
  },
  invitationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  invitationIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EDEAF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  invitationText: {
    flex: 1,
  },
  invitationGroupName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginBottom: 2,
  },
  invitationInviter: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
    marginTop: 2,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: CTA,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  denyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  denyButtonText: {
    color: '#14141A',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#4A4A55',
    marginTop: 12,
  },
  createGroupButton: {
    backgroundColor: QUICK_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  createGroupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createGroupText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#2E2E37',
  },
  dashboardButton: {
    backgroundColor: CTA,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

