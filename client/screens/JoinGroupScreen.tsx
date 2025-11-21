import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchGroups, joinGroup } from '../services/groupsService';
import React from 'react';

type Group = {
  id: number;
  name: string;
};

type RootStackParamList = {
  JoinGroup: undefined;
  RoommateDashboard: undefined;
  CreateGroup: undefined;
};

export default function JoinGroupScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'JoinGroup'>>();

  // Search groups as they type
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchGroups(searchQuery);
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

  const handleJoinGroup = async (groupId: number, groupName: string) => {
    if (isJoining) return;

    setIsJoining(true);
    try {
      await joinGroup(groupId);
      Alert.alert('Success', `You've joined "${groupName}"!`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('RoommateDashboard' as never)
        }
      ]);
    } catch (error: any) {
      console.error('Join group error:', error);
      Alert.alert('Error', error.message || 'Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Group</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search for groups..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Search Results */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7D60A3" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}
        
        {searchQuery.trim().length > 0 && !isSearching && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchResults.length > 0 ? 'Search Results' : 'No groups found'}
            </Text>
            {searchResults.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupItem}
                onPress={() => handleJoinGroup(group.id, group.name)}
                disabled={isJoining}
              >
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupInitial}>
                    {group.name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.joinButton, isJoining && styles.joinButtonDisabled]}
                  onPress={() => handleJoinGroup(group.id, group.name)}
                  disabled={isJoining}
                >
                  <Text style={styles.joinButtonText}>
                    {isJoining ? 'Joining...' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchQuery.trim().length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Search for a group by name to join
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 72,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7D60A3',
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#14141A',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#000000',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C9C9EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7D60A3',
    fontFamily: 'Inter',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
  },
  joinButton: {
    backgroundColor: '#7D60A3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});

