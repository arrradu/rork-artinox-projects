import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Plus, FolderOpen } from 'lucide-react-native';
import { useApp, useProjectFinancials } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Project } from '@/types';

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const { remaining } = useProjectFinancials(project.id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/project/${project.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {project.title}
        </Text>
        <TagStatus type="project" status={project.status} size="small" />
      </View>

      <Text style={styles.cardClient} numberOfLines={1}>
        {project.client_name}
      </Text>

      {project.value_total !== undefined && (
        <View style={styles.cardFooter}>
          <Text style={styles.cardLabel}>Rest de încasat:</Text>
          <Money amount={remaining} size="small" color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, projectsLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.client_name.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

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
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/create-project' as any)}
              style={styles.headerButton}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
});
