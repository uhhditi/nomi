import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser } from '../services/groupsService';

type RootStackParamList = {
  RoommateDashboard: undefined;
  Start: undefined;
  NomiStart: undefined;
  GroupWorkflow: undefined;
};

export default function NomiStartScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'NomiStart'>>();
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
  }

  const { login, register, user } = auth;

  // Check if user already has a group after login/register
  useEffect(() => {
    const checkGroups = async () => {
      if (!user?.id) return;
      
      try {
        const groups = await listGroupsForUser(user.id);
        if (groups.length > 0) {
          // User already in a group, go straight to dashboard
          navigation.navigate('RoommateDashboard' as never);
        } else {
          // User has no group, go to join/create screen
          navigation.navigate('JoinOrCreateGroup' as never);
        }
      } catch (error) {
        // Error checking groups, go to join/create screen as fallback
        console.error('Error checking groups:', error);
        navigation.navigate('JoinOrCreateGroup' as never);
      }
    };

    if (user?.id) {
      checkGroups();
    }
  }, [user?.id, navigation]);

  const handleSignIn = async () => {
    try {
      const data = await login(email, password);
      if (data.accessToken || data.refreshToken) {
        // Navigation will be handled by useEffect when user is set
        // If no group, user will stay on this screen or go to JoinOrCreateGroup
        // If has group, useEffect will navigate to RoommateDashboard
      }
    } catch (error) {
      alert("wrong password or email");
    }
  };

  const handleSignUp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter your first and last name");
      return;
    }
    try {
      const data = await register(email, password, firstName.trim(), lastName.trim());
      // Navigation will be handled by useEffect when user is set
      // New users won't have a group, so they'll need to create/join one
    } catch (err) {
      console.error(err);
      alert("Sign up failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <Text style={styles.brand}>nomi</Text>
        <Text style={styles.subtitle}>Simplified Shared Living</Text>

        {/* Toggle */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggleBg}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
              onPress={() => setMode('signin')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
              onPress={() => setMode('signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'signin' ? (
          <>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter your email" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <MaterialCommunityIcons name="email-outline" size={18} color="#14141A" />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter your password" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input} 
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons name="eye-off-outline" size={18} color="#14141A" />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter first name" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <Ionicons name="person-outline" size={18} color="#14141A" />
            </View>
            {/* Last Name */}
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter last name" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              <Ionicons name="person-outline" size={18} color="#14141A" />
            </View>
            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter email address" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <MaterialCommunityIcons name="email-outline" size={18} color="#14141A" />
            </View>
            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Create password" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input} 
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons name="lock-closed-outline" size={18} color="#14141A" />
            </View>

            {/* Password rules as rows */}
            <View style={styles.rulesList}>
              <View style={styles.ruleRow}>
                <View style={styles.ruleBullet} />
                <Text style={styles.ruleText}>At least 8 characters</Text>
              </View>
              <View style={styles.ruleRow}>
                <View style={styles.ruleBullet} />
                <Text style={styles.ruleText}>One uppercase letter</Text>
              </View>
              <View style={styles.ruleRow}>
                <View style={styles.ruleBullet} />
                <Text style={styles.ruleText}>One number</Text>
              </View>
            </View>

            {/* Confirm */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Confirm password" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input} 
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Ionicons name="lock-closed-outline" size={18} color="#14141A" />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp}>
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const CARD_BG = '#C9C9EE';
const BORDER = '#E4E3EE';
const QUICK_BG = '#E3E3F6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 72,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 40,
  },
  brand: {
    fontSize: 56,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: '#577A76',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#14141A',
    marginTop: 6,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  toggleWrap: {
    marginTop: 24,
    marginBottom: 12,
  },
  toggleBg: {
    backgroundColor: '#F1F2F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: CARD_BG,
  },
  toggleText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
    fontSize: 16,
  },
  toggleTextActive: {
    fontWeight: '600',
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  inlineRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#14141A',
    marginRight: 8,
  },
  inlineText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#14141A',
  },
  link: {
    color: '#5B61FF',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 18,
    color: '#14141A',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  hr: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  orText: {
    marginHorizontal: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#6B7280',
  },
  oauthBtn: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  oauthText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#14141A',
  },
  rulesList: {
    marginTop: 8,
    marginBottom: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BORDER,
    marginRight: 8,
  },
  ruleText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#6B7280',
  },
});


