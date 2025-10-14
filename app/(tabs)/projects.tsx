import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Plus, FolderOpen, Filter, MoreVertical, Edit2, Archive, Trash2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Project } from '@/types';

function ProjectCard({ project, onEdit, onArchive, onDelete }: { 
  project: Project;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const { clients, contracts, currentUser } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const client = useMemo(() => clients.find(c => c.id === project.client_id), [clients, project.client_id]);
  const projectContracts = useMemo(() => contracts.filter(c => c.project_id === project.id), [contracts, project.id]);
  
  const totalRemaining = useMemo(() => {
    return projectContracts.reduce((sum, c) => sum + c.remaining_eur, 0);
  }, [projectContracts]);

  const isAdmin = currentUser.role === 'admin';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/project/${project.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {project.name}
        </Text>
        <View style={styles.cardHeaderRight}>
          <TagStatus type="project" status={project.status} size="small" />
          {isAdmin && (
            <TouchableOpacity
              onPress={() => setShowMenu(true)}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.cardClient} numberOfLines={1}>
        {client?.name || 'Client necunoscut'}
      </Text>

      {projectContracts.length > 0 && (
        <View style={styles.cardFooter}>
          <Text style={styles.cardLabel}>Rest de încasat:</Text>
          <Money amount={totalRemaining} size="small" color={colors.primary} />
        </View>
      )}

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onEdit();
              }}
            >
              <Edit2 size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Editează</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onArchive();
              }}
            >
              <Archive size={20} color={colors.warning} />
              <Text style={[styles.menuItemText, { color: colors.warning }]}>Arhivează</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onDelete();
              }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Șterge</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

type DateFilter = 'all' | 'current_month' | 'last_3_months' | 'current_year';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, projectsLoading, updateProject, deleteProject, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
  };

  const handleSaveEdit = async () => {
    if (!editingProject || !editName.trim()) return;
    
    try {
      await updateProject(editingProject.id, { name: editName.trim() });
      setEditingProject(null);
      setEditName('');
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut actualiza proiectul');
    }
  };

  const handleArchive = (project: Project) => {
    Alert.alert(
      'Arhivează proiect',
      `Sigur vrei să arhivezi proiectul "${project.name}"?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Arhivează',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProject(project.id, { status: 'anulat' });
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut arhiva proiectul');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Șterge proiect',
      `Sigur vrei să ștergi definitiv proiectul "${project.name}"? Această acțiune nu poate fi anulată.`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut șterge proiectul');
            }
          },
        },
      ]
    );
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (dateFilter !== 'all') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      filtered = filtered.filter((p) => {
        const projectDate = new Date(p.created_at);
        const projectYear = projectDate.getFullYear();
        const projectMonth = projectDate.getMonth();

        switch (dateFilter) {
          case 'current_month':
            return projectYear === currentYear && projectMonth === currentMonth;
          case 'last_3_months':
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return projectDate >= threeMonthsAgo;
          case 'current_year':
            return projectYear === currentYear;
          default:
            return true;
        }
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [projects, searchQuery, dateFilter]);

  if (projectsLoading) {
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
          title: 'Proiecte',
          headerRight: () => isAdmin ? (
            <TouchableOpacity
              onPress={() => router.push('/create-project' as any)}
              style={styles.headerButton}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : null,
        }}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută proiecte sau clienți..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Filter size={20} color={dateFilter !== 'all' ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrare după dată</Text>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                dateFilter === 'current_month' && styles.filterOptionActive,
              ]}
              onPress={() => {
                setDateFilter('current_month');
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  dateFilter === 'current_month' && styles.filterOptionTextActive,
                ]}
              >
                Luna curentă
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                dateFilter === 'last_3_months' && styles.filterOptionActive,
              ]}
              onPress={() => {
                setDateFilter('last_3_months');
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  dateFilter === 'last_3_months' && styles.filterOptionTextActive,
                ]}
              >
                Ultimele 3 luni
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                dateFilter === 'current_year' && styles.filterOptionActive,
              ]}
              onPress={() => {
                setDateFilter('current_year');
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  dateFilter === 'current_year' && styles.filterOptionTextActive,
                ]}
              >
                Anul curent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                dateFilter === 'all' && styles.filterOptionActive,
              ]}
              onPress={() => {
                setDateFilter('all');
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  dateFilter === 'all' && styles.filterOptionTextActive,
                ]}
              >
                Toate
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={searchQuery ? 'Niciun rezultat' : 'Niciun proiect'}
          description={
            searchQuery
              ? 'Încearcă să cauți altceva'
              : 'Apasă + pentru a crea primul proiect'
          }
        />
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard 
              project={item}
              onEdit={() => handleEdit(item)}
              onArchive={() => handleArchive(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={editingProject !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingProject(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditingProject(null)}
        >
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Editează proiect</Text>
            
            <Text style={styles.inputLabel}>Nume proiect</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nume proiect"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />

            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalButtonCancel]}
                onPress={() => setEditingProject(null)}
              >
                <Text style={styles.editModalButtonTextCancel}>Anulează</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalButtonSave]}
                onPress={handleSaveEdit}
                disabled={!editName.trim()}
              >
                <Text style={styles.editModalButtonTextSave}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  cardClient: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  filterOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  },
  editModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editModalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editModalButtonSave: {
    backgroundColor: colors.primary,
  },
  editModalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  editModalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
