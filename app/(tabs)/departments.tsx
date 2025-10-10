import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Users, Search } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Department } from '@/types';

const DEPARTMENT_LABELS: Record<Department, string> = {
  sales: 'Vânzări',
  produce: 'Producție',
  conta: 'Contabilitate',
  depozit: 'Depozit',
  vamuire: 'Vămuire',
  livrare: 'Livrare',
  achizitii: 'Achiziții',
  logistica: 'Logistică',
};

const DEPARTMENTS: Department[] = [
  'sales',
  'produce',
  'conta',
  'depozit',
  'vamuire',
  'livrare',
  'achizitii',
  'logistica',
];

interface DepartmentCardProps {
  department: Department;
  memberCount: number;
  onPress: () => void;
}

function DepartmentCard({ department, memberCount, onPress }: DepartmentCardProps) {
  return (
    <TouchableOpacity
      style={styles.departmentCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.departmentIcon}>
        <Users size={28} color={colors.primary} />
      </View>
      <View style={styles.departmentInfo}>
        <Text style={styles.departmentName}>{DEPARTMENT_LABELS[department]}</Text>
        <Text style={styles.departmentCount}>
          {memberCount} {memberCount === 1 ? 'membru' : 'membri'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DepartmentsScreen() {
  const { users, usersLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departmentData = useMemo(() => {
    return DEPARTMENTS.map(dept => ({
      department: dept,
      memberCount: users.filter(u => u.department === dept).length,
    }));
  }, [users]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departmentData;
    
    const query = searchQuery.toLowerCase();
    return departmentData.filter(d =>
      DEPARTMENT_LABELS[d.department].toLowerCase().includes(query)
    );
  }, [departmentData, searchQuery]);

  const handleDepartmentPress = (department: Department) => {
    router.push(`/department/${department}`);
  };

  if (usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Departamente' }} />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută departament..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredDepartments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Niciun departament"
          description="Nu există departamente care să corespundă căutării"
        />
      ) : (
        <FlatList
          data={filteredDepartments}
          keyExtractor={(item) => item.department}
          renderItem={({ item }) => (
            <DepartmentCard
              department={item.department}
              memberCount={item.memberCount}
              onPress={() => handleDepartmentPress(item.department)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  departmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  departmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  departmentCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
