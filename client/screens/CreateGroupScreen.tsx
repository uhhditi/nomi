import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchUsers, createGroup, listGroupsForUser } from '../services/groupsService';
import { useAuth } from '../context/AuthContext';
import React from 'react';



type Friend = {
  id: number;
  username: string;
  email: string;
};

type RootStackParamList = {
  CreateGroup: undefined;
  Dashboard: undefined;
  RoommateDashboard: undefined;
};

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMembers, setAddedMembers] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasGroups, setHasGroups] = useState(false);
  const [isCheckingGroups, setIsCheckingGroups] = useState(true);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>>();
  const auth = useAuth();
  const user = auth?.user;

  // Check if user has any groups
  useEffect(() => {
    const checkUserGroups = async () => {
      if (!user?.id) {
        setIsCheckingGroups(false);
        return;
      }
      
      try {
        const groups = await listGroupsForUser(user.id);
        setHasGroups(groups.length > 0);
      } catch (error) {
        console.error('Error checking user groups:', error);
        setHasGroups(false);
      } finally {
        setIsCheckingGroups(false);
      }
    };

    checkUserGroups();
  }, [user?.id]);

  // Search users as they type
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
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
  }, [searchQuery]);

  const isAdded = (friendId: number) => {
    return addedMembers.some(member => member.id === friendId);
  };

  // const handleAddMember = (friend: Friend) => {
  //   if (!isAdded(friend.id)) {
  //     setAddedMembers([...addedMembers, friend]);
  //   }
  // };
  const handleToggleMember = (friend: Friend) => {
    setAddedMembers(prev => {
      const isCurrentlyAdded = prev.some(member => member.id === friend.id);
      
      if (isCurrentlyAdded) {
        // Remove the member
        return prev.filter(member => member.id !== friend.id);
      } else {
        // Add the member
        return [...prev, friend];
      }
    });
  };


  const handleRemoveMember = (friendId: number) => {
    setAddedMembers(prev => prev.filter(member => member.id !== friendId));
  };

  // const filteredFriends = suggestedFriends.filter(friend =>
  //   friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const handleCreateGroup = async () => {
    if (isCreating) {
      //console.log('Already creating group, ignoring click');
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (addedMembers.length === 0) {
      Alert.alert('Error', 'Please add at least one member');
      return;
    }

    if (addedMembers.some(m => !m.username)) {
      Alert.alert('Error', 'One or more added members have invalid usernames.');
      return;
    }

    setIsCreating(true);

    try {
      const memberUsernames = addedMembers.map(m => m.username);
      //console.log('Creating group with:', { name: groupName, members: memberUsernames });
      
      const result = await createGroup(groupName, memberUsernames);
      
      // console.log('Group created successfully:', result);
      
      Alert.alert('Success', `Group "${result.name}" created!`, [
        { 
          text: 'OK', 
          onPress: () => {
            setGroupName('');
            setAddedMembers([]);
            setSearchQuery('');
            setSearchResults([]);
            navigation.navigate('Dashboard');
          }
        }
      ]);
    } catch (e: any) {
      console.error('Create group error:', e);
      Alert.alert(
        'Error', 
        e.message || 'Failed to create group. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };


return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={{width: 50}} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Already Have a Group Section - Only show if user has groups */}
        {!isCheckingGroups && hasGroups && (
          <View style={styles.alreadyHaveGroupSection}>
            <Text style={styles.alreadyHaveGroupText}>Already have a group?</Text>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => navigation.navigate('RoommateDashboard')}
            >
              <Text style={styles.skipButtonText}>Skip to Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
          </View>
        )}

        {/* Group Name Input */}
        <TextInput
          placeholder="Group name"
          placeholderTextColor="#999999"
          value={groupName}
          onChangeText={setGroupName}
          style={styles.groupNameInput}
        />

        {/* Added Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionText}>
            {addedMembers.length === 0 
              ? 'Add members to get started.' 
              : `${addedMembers.length} member(s) added`}
          </Text>
          <View style={styles.addedMembersContainer}>
            {addedMembers.map((member) => (
              <View key={member.id} style={styles.memberAvatarContainer}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {member.username[0].toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMember(member.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
                <Text style={styles.memberUsername}>{member.username}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search usernames..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Search Results */}
        {isSearching && <Text style={styles.loadingText}>Searching...</Text>}
        
        {searchQuery.trim().length > 0 && !isSearching && (
          <View style={styles.friendsList}>
            <Text style={styles.suggestedTitle}>
              {searchResults.length > 0 ? 'Search Results' : 'No users found'}
            </Text>
            {searchResults.map((friend) => {
              const added = isAdded(friend.id);
              return (
                <View key={friend.id} style={styles.friendItem}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.avatarInitial}>
                      {friend.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.username}</Text>
                    <Text style={styles.friendUsername}>{friend.email}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, added && styles.addedButton]}
                    onPress={() => handleToggleMember(friend)}
                    activeOpacity={1}
                  >
                    <Text style={[styles.addButtonText, added && styles.addedButtonText]}>
                      {added ? 'Added' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Create Group Button */}
      <TouchableOpacity 
        style={[
          styles.createButton, 
          (!groupName.trim() || addedMembers.length === 0 || isCreating) && styles.createButtonDisabled
        ]} 
        onPress={handleCreateGroup}
        disabled={!groupName.trim() || addedMembers.length === 0 || isCreating}
      >
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alreadyHaveGroupSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  alreadyHaveGroupText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#999999',
    marginBottom: 12,
  },
  skipButton: {
    backgroundColor: '#3F3F96',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E4E3EE',
  },
  groupNameInput: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter',
    marginBottom: 20,
    color: '#000000',
  },
  section: {
    marginBottom: 20,
  },
  sectionText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  addedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberAvatarContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9C9EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#000000',
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  friendsList: {
    marginBottom: 100,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9C9EE',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  addButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addedButton: {
    backgroundColor: '#E0E0E0',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  addedButtonText: {
    color: '#666666',
  },
  createButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginVertical: 20,
  },
  memberInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberUsername: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'Inter',
    marginTop: 4,
    textAlign: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});