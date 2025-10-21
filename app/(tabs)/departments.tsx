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
import { Stack, router } from 'expo-router';
import { Users, Search, Plus, X } from 'lucide-react-native';
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
  const { users, usersLoading, currentUser, createUser } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('sales');
  const [isCreating, setIsCreating] = useState<boolean>(false);

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

  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      Alert.alert('Eroare', 'Te rog introdu numele utilizatorului.');
      return;
    }
    if (!newUserEmail.trim()) {
      Alert.alert('Eroare', 'Te rog introdu emailul utilizatorului.');
      return;
    }

    setIsCreating(true);
    try {
      await createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: selectedDepartment,
        department: selectedDepartment,
      });
      
      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setSelectedDepartment('sales');
      Alert.alert('Succes', 'Utilizatorul a fost adăugat cu succes!');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Eroare', 'Nu am putut adăuga utilizatorul. Te rog încearcă din nou.');
    } finally {
      setIsCreating(false);
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

      {currentUser.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă utilizator nou</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nume complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Adrian Radu"
                placeholderTextColor={colors.textSecondary}
                value={newUserName}
                onChangeText={setNewUserName}
                editable={!isCreating}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: adrian@artinox.ro"
                placeholderTextColor={colors.textSecondary}
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isCreating}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Departament</Text>
              <View style={styles.departmentGrid}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.departmentChip,
                      selectedDepartment === dept && styles.departmentChipSelected,
                    ]}
                    onPress={() => setSelectedDepartment(dept)}
                    disabled={isCreating}
                  >
                    <Text
                      style={[
                        styles.departmentChipText,
                        selectedDepartment === dept && styles.departmentChipTextSelected,
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
                onPress={() => setShowAddModal(false)}
                disabled={isCreating}
              >
                <Text style={styles.buttonSecondaryText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleAddUser}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Adaugă</Text>
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
