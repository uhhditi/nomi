import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchUsers, addMember, listMembers, listGroupsForUser } from '../services/groupsService';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type Friend = {
  id: number;
  email: string;
};

type RootStackParamList = {
  ManageGroup: undefined;
  RoommateDashboard: undefined;
};

export default function ManageGroupScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMembers, setAddedMembers] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ id: number; name: string } | null>(null);
  const [currentMembers, setCurrentMembers] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ManageGroup'>>();
  const auth = useAuth();
  const user = auth?.user;

  // Load group info and current members
  useEffect(() => {
    const loadGroupInfo = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const groups = await listGroupsForUser(user.id);
        if (groups.length > 0) {
          const group = groups[0];
          setGroupInfo(group);
          
          // Load current members
          const members = await listMembers(group.id);
          setCurrentMembers(members);
        }
      } catch (error) {
        console.error('Error loading group info:', error);
        Alert.alert('Error', 'Failed to load group information.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupInfo();
  }, [user?.id]);

  // Search users as they type
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          // Filter out users who are already members
          const memberIds = currentMembers.map(m => m.id);
          const filteredResults = results.filter(r => !memberIds.includes(r.id));
          setSearchResults(filteredResults);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // Debounce search by 500ms
    return () => clearTimeout(searchTimeout);
  }, [searchQuery, currentMembers]);

  const isAdded = (friendId: number) => {
    return addedMembers.some(member => member.id === friendId);
  };

  const handleAddMember = (friend: Friend) => {
    if (isAdded(friend.id)) {
      setAddedMembers(prev => prev.filter(m => m.id !== friend.id));
    } else {
      setAddedMembers(prev => [...prev, friend]);
    }
  };

  const handleRemoveFromQueue = (friendId: number) => {
    setAddedMembers(prev => prev.filter(m => m.id !== friendId));
  };

  const handleAddMembers = async () => {
    if (addedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member to add');
      return;
    }

    if (!groupInfo) {
      Alert.alert('Error', 'Group information not found');
      return;
    }

    setIsAdding(true);

    try {
      // Add each member
      for (const member of addedMembers) {
        await addMember(groupInfo.id, member.email);
      }

      Alert.alert('Success', `${addedMembers.length} member(s) added successfully!`, [
        {
          text: 'OK',
          onPress: () => {
            setAddedMembers([]);
            setSearchQuery('');
            setSearchResults([]);
            // Reload members
            listMembers(groupInfo.id).then(setCurrentMembers).catch(console.error);
          }
        }
      ]);
    } catch (e: any) {
      console.error('Add member error:', e);
      Alert.alert(
        'Error',
        e.message || 'Failed to add members. Please try again.'
      );
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!groupInfo) {
    return (
      <View style={styles.container}>
        <Text>No group found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#14141A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Group</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Name */}
        <Text style={styles.groupName}>{groupInfo.name}</Text>

        {/* Current Members */}
        <Text style={styles.sectionTitle}>Current Members ({currentMembers.length})</Text>
        <View style={styles.membersList}>
          {currentMembers.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {member.email[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
          ))}
        </View>

        {/* Add Members Section */}
        <Text style={styles.sectionTitle}>Add Members</Text>
        
        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email..."
          placeholderTextColor="#9AA0A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Search Results */}
        {isSearching && (
          <Text style={styles.searchingText}>Searching...</Text>
        )}

        {!isSearching && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={[
                  styles.searchResultItem,
                  isAdded(friend.id) && styles.searchResultItemSelected
                ]}
                onPress={() => handleAddMember(friend)}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {friend.email[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberEmail}>{friend.email}</Text>
                {isAdded(friend.id) && (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Members to Add */}
        {addedMembers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Selected to Add ({addedMembers.length})
            </Text>
            <View style={styles.addedMembersContainer}>
              {addedMembers.map((member) => (
                <View key={member.id} style={styles.addedMemberItem}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.email[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFromQueue(member.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Add Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            (addedMembers.length === 0 || isAdding) && styles.addButtonDisabled
          ]}
          onPress={handleAddMembers}
          disabled={addedMembers.length === 0 || isAdding}
        >
          <Text style={styles.addButtonText}>
            {isAdding ? 'Adding...' : `Add ${addedMembers.length} Member(s)`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E3EE',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#14141A',
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#14141A',
    marginTop: 20,
    marginBottom: 12,
  },
  membersList: {
    marginBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F1F2F6',
    borderRadius: 10,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C9C9EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14141A',
  },
  memberEmail: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  searchInput: {
    backgroundColor: '#F1F2F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#14141A',
    borderWidth: 1,
    borderColor: '#E4E3EE',
    marginBottom: 12,
  },
  searchingText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  searchResults: {
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E4E3EE',
  },
  searchResultItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  addedMembersContainer: {
    marginBottom: 12,
  },
  addedMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  removeButton: {
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#7D60A3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  addButtonDisabled: {
    backgroundColor: '#D7D7EA',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
});

