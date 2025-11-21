import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser } from '../services/groupsService';

type RootStackParamList = {
  JoinOrCreateGroup: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
  RoommateDashboard: undefined;
};

export default function JoinOrCreateGroupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'JoinOrCreateGroup'>>();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  // Check if user already has a group and redirect
  useEffect(() => {
    const checkUserGroups = async () => {
      if (!user?.id) return;
      
      try {
        const groups = await listGroupsForUser(user.id);
        if (groups.length > 0) {
          // User already in a group, redirect to dashboard
          navigation.navigate('RoommateDashboard' as never);
        }
      } catch (error) {
        console.error('Error checking user groups:', error);
      }
    };

    checkUserGroups();
  }, [user?.id, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subtitle}>Join an existing group or create a new one</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('JoinGroup')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Join Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14141A',
    fontFamily: 'Inter',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7D60A3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7D60A3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  secondaryButtonText: {
    color: '#7D60A3',
  },
});

