import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { User, Mail, LogOut } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function AccountScreen() {
  const { currentUser } = useApp();

  const handleLogout = () => {
    Alert.alert('Logout', 'Funcționalitate de logout va fi implementată', [
      { text: 'OK' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Cont' }} />

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={48} color={colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={colors.textSecondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Nume</Text>
                <Text style={styles.infoValue}>{currentUser.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={20} color={colors.textSecondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{currentUser.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutButtonText}>Deconectare</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  infoSection: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.error,
  },
});
