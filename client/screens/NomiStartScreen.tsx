import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

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
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'NomiStart'>>();
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
  }

  const { login, register } = auth;

  const handleSignIn = async () => {
    // For now, just navigate to dashboard without authentication check
    navigation.navigate('RoommateDashboard');
  };

  const handleSignUp = async () => {
    // For now, just navigate to group workflow without authentication check
    navigation.navigate('GroupWorkflow');
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
            {/* Username/email */}
            <Text style={styles.label}>Username or Email</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter your username or email" 
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

            {/* Row: remember + forgot */}
            <View style={styles.inlineRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.checkbox} />
                <Text style={styles.inlineText}>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.hr} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.hr} />
            </View>

            <View style={styles.oauthBtn}>
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={styles.oauthText}>Continue with Google</Text>
            </View>
            <View style={styles.oauthBtn}>
              <Ionicons name="logo-apple" size={18} color="#14141A" />
              <Text style={styles.oauthText}>Continue with Apple</Text>
            </View>
          </>
        ) : (
          <>
            {/* Username */}
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <TextInput 
                placeholder="Enter username" 
                placeholderTextColor="#9AA0A6" 
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
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

            <View style={styles.orRow}>
              <View style={styles.hr} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.hr} />
            </View>

            <View style={styles.oauthBtn}>
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={styles.oauthText}>Continue with Google</Text>
            </View>
            <View style={styles.oauthBtn}>
              <Ionicons name="logo-apple" size={18} color="#14141A" />
              <Text style={styles.oauthText}>Continue with Apple</Text>
            </View>
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


