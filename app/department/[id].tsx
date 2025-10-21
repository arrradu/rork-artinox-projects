import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Search, AlertCircle, Plus, X, Edit2, Trash2 } from 'lucide-react-native';
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
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin: boolean;
}

function MemberCard({ user, openTasksCount, overdueTasksCount, onPress, onEdit, onDelete, isAdmin }: MemberCardProps) {
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
      {isAdmin && (
        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Edit2 size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DepartmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: Department }>();
  const { tasks, usersLoading, users, currentUser, updateUser, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<Department>('sales');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const ALL_DEPARTMENTS: Department[] = [
    'sales',
    'produce',
    'conta',
    'depozit',
    'vamuire',
    'livrare',
    'achizitii',
    'logistica',
  ];

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

  const handleEditMember = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditDepartment(user.department);
    setShowEditModal(true);
  };

  const handleDeleteMember = (user: User) => {
    Alert.alert(
      'Șterge utilizator',
      `Ești sigur că vrei să ștergi utilizatorul ${user.name}?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Succes', 'Utilizatorul a fost șters.');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Eroare', 'Nu am putut șterge utilizatorul.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    if (!editName.trim()) {
      Alert.alert('Eroare', 'Te rog introdu numele utilizatorului.');
      return;
    }
    if (!editEmail.trim()) {
      Alert.alert('Eroare', 'Te rog introdu emailul utilizatorului.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        department: editDepartment,
        role: editDepartment,
      });
      
      setShowEditModal(false);
      setEditingUser(null);
      Alert.alert('Succes', 'Utilizatorul a fost actualizat cu succes!');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Eroare', 'Nu am putut actualiza utilizatorul. Te rog încearcă din nou.');
    } finally {
      setIsUpdating(false);
    }
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
              onEdit={() => handleEditMember(item.user)}
              onDelete={() => handleDeleteMember(item.user)}
              isAdmin={currentUser.role === 'admin'}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editează utilizator</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nume complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Adrian Radu"
                placeholderTextColor={colors.textSecondary}
                value={editName}
                onChangeText={setEditName}
                editable={!isUpdating}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: adrian@artinox.ro"
                placeholderTextColor={colors.textSecondary}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isUpdating}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Departament</Text>
              <View style={styles.departmentGrid}>
                {ALL_DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.departmentChip,
                      editDepartment === dept && styles.departmentChipSelected,
                    ]}
                    onPress={() => setEditDepartment(dept)}
                    disabled={isUpdating}
                  >
                    <Text
                      style={[
                        styles.departmentChipText,
                        editDepartment === dept && styles.departmentChipTextSelected,
                      ]}
                    >
                      {DEPARTMENT_LABELS[dept]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.buttonSecondaryText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleUpdateUser}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Salvează</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  memberActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  departmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  departmentChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  departmentChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  departmentChipTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
