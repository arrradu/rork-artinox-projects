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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Plus, FolderOpen, Filter } from 'lucide-react-native';
import { useApp, useProjectFinancials, useClientById, useContractsByProjectId } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Project } from '@/types';

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const { remaining } = useProjectFinancials(project.id);
  const client = useClientById(project.client_id);
  const contracts = useContractsByProjectId(project.id);

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
        <TagStatus type="project" status={project.status} size="small" />
      </View>

      <Text style={styles.cardClient} numberOfLines={1}>
        {client?.nume || 'Client necunoscut'}
      </Text>

      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaText}>
          Contracte: {contracts.length} • Valoare: {project.total_value_eur.toFixed(0)} EUR
        </Text>
      </View>

      {project.total_value_eur > 0 && (
        <View style={styles.cardFooter}>
          <Text style={styles.cardLabel}>Rest de încasat:</Text>
          <Money amount={remaining} size="small" color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

type DateFilter = 'all' | 'current_month' | 'last_3_months' | 'current_year';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, projectsLoading, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

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
        (p) =>
          p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [projects, searchQuery, dateFilter]);

  const isAdmin = currentUser.role === 'admin';

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
        }}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută proiecte..."
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
          renderItem={({ item }) => <ProjectCard project={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-project' as any)}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
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
    paddingBottom: 100,
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
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  cardClient: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardMeta: {
    marginBottom: 12,
  },
  cardMetaText: {
    fontSize: 12,
    color: colors.textTertiary,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
