import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';

type Friend = {
  id: string;
  name: string;
  username: string;
  description?: string;
  avatar?: any;
};

type RootStackParamList = {
  CreateGroup: undefined;
  Dashboard: undefined;
};

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMembers, setAddedMembers] = useState<Friend[]>([]);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>>();

  // Mock suggested friends data
  const suggestedFriends: Friend[] = [
    {
      id: '1',
      name: 'Sarah Wilson',
      username: '@sarah_wilson',
      description: 'Mutual friend with Emma',
      avatar: require('../assets/pfp.png'),
    },
    {
      id: '2',
      name: 'Mike Chen',
      username: '@mike_chen',
      description: 'Recently interacted',
      avatar: require('../assets/pfp.png'),
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      username: '@alex_rod',
      avatar: require('../assets/pfp.png'),
    },
    {
      id: '4',
      name: 'Emma Davis',
      username: '@emma_davis',
      description: 'Mutual friend with Sarah',
      avatar: require('../assets/pfp.png'),
    },
  ];

  const isAdded = (friendId: string) => {
    return addedMembers.some(member => member.id === friendId);
  };

  const handleAddMember = (friend: Friend) => {
    if (!isAdded(friend.id)) {
      setAddedMembers([...addedMembers, friend]);
    }
  };

  const handleRemoveMember = (friendId: string) => {
    setAddedMembers(addedMembers.filter(member => member.id !== friendId));
  };

  const filteredFriends = suggestedFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = () => {
    // Frontend only - no backend implementation yet
    console.log('Creating group:', { groupName, members: addedMembers });
    // Could navigate back or show success message
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <TouchableOpacity>
          <Text style={styles.nextButton}>Next</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.sectionText}>Add members to get started.</Text>
          <View style={styles.addedMembersContainer}>
            {addedMembers.map((member) => (
              <View key={member.id} style={styles.memberAvatarContainer}>
                <Image source={member.avatar || require('../assets/pfp.png')} style={styles.memberAvatar} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMember(member.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
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

        {/* Suggested Friends Section */}
        <Text style={styles.suggestedTitle}>Suggested Friends</Text>
        <View style={styles.friendsList}>
          {filteredFriends.map((friend) => {
            const added = isAdded(friend.id);
            return (
              <View key={friend.id} style={styles.friendItem}>
                <Image
                  source={friend.avatar || require('../assets/pfp.png')}
                  style={styles.friendAvatar}
                />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>{friend.username}</Text>
                  {friend.description && (
                    <Text style={styles.friendDescription}>{friend.description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.addButton, added && styles.addedButton]}
                  onPress={() => handleAddMember(friend)}
                  disabled={added}
                >
                  <Text style={[styles.addButtonText, added && styles.addedButtonText]}>
                    {added ? 'Added' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Create Group Button */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
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
  nextButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C9C9EE',
    fontFamily: 'Inter',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginRight: 12,
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
  friendDescription: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
  },
  addButton: {
    backgroundColor: '#C9C9EE',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addedButton: {
    backgroundColor: '#C9C9EE',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  addedButtonText: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#C9C9EE',
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
});

