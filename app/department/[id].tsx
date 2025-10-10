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
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Search, AlertCircle } from 'lucide-react-native';
import { useApp, useUsersByDepartment, useTasksByUserId } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Department, User } from '@/types';

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

interface MemberCardProps {
  user: User;
  openTasksCount: number;
  overdueTasksCount: number;
  onPress: () => void;
}

function MemberCard({ user, openTasksCount, overdueTasksCount, onPress }: MemberCardProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitials}>{initials}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{user.name}</Text>
        <Text style={styles.memberEmail}>{user.email}</Text>
        <View style={styles.badgesContainer}>
          {overdueTasksCount > 0 && (
            <View style={[styles.badge, styles.badgeOverdue]}>
              <AlertCircle size={14} color={colors.error} />
              <Text style={styles.badgeTextOverdue}>
                Overdue: {overdueTasksCount}
              </Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Deschise: {openTasksCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DepartmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: Department }>();
  const { tasks, usersLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const members = useUsersByDepartment(id as Department);

  const membersWithStats = useMemo(() => {
    const today = new Date();
    
    return members.map(user => {
      const userTasks = tasks.filter(t => t.assignee === user.name);
      const openTasks = userTasks.filter(t => t.status !== 'done');
      const overdueTasks = openTasks.filter(t => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < today;
      });

      return {
        user,
        openTasksCount: openTasks.length,
        overdueTasksCount: overdueTasks.length,
      };
    });
  }, [members, tasks]);

  const sortedMembers = useMemo(() => {
    return [...membersWithStats].sort((a, b) => {
      if (a.overdueTasksCount !== b.overdueTasksCount) {
        return b.overdueTasksCount - a.overdueTasksCount;
      }
      return b.openTasksCount - a.openTasksCount;
    });
  }, [membersWithStats]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return sortedMembers;
    
    const query = searchQuery.toLowerCase();
    return sortedMembers.filter(m =>
      m.user.name.toLowerCase().includes(query) ||
      m.user.email.toLowerCase().includes(query)
    );
  }, [sortedMembers, searchQuery]);

  const handleMemberPress = (userId: string) => {
    router.push(`/person/${userId}`);
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
      <Stack.Screen 
        options={{ 
          title: DEPARTMENT_LABELS[id as Department] || 'Departament',
        }} 
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută membru..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Niciun membru"
          description={
            searchQuery
              ? 'Nu există membri care să corespundă căutării'
              : 'Nu există membri în acest departament'
          }
        />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.user.id}
          renderItem={({ item }) => (
            <MemberCard
              user={item.user}
              openTasksCount={item.openTasksCount}
              overdueTasksCount={item.overdueTasksCount}
              onPress={() => handleMemberPress(item.user.id)}
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
  memberCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    gap: 4,
  },
  badgeOverdue: {
    backgroundColor: `${colors.error}15`,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  badgeTextOverdue: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.error,
  },
});
