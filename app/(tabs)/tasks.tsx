import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { CheckSquare } from 'lucide-react-native';
import { useMyTasks, useApp } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import DeadlineBadge from '@/components/DeadlineBadge';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Task, TaskStatus } from '@/types';

function TaskItem({ task }: { task: Task }) {
  const { updateTask, projects } = useApp();
  const project = projects.find((p) => p.id === task.project_id);

  const handleToggleStatus = async () => {
    const newStatus: TaskStatus =
      task.status === 'done' ? 'todo' : task.status === 'todo' ? 'doing' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  return (
    <TouchableOpacity
      style={[styles.taskCard, task.status === 'done' && styles.taskCardDone]}
      onPress={handleToggleStatus}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text
            style={[
              styles.taskTitle,
              task.status === 'done' && styles.taskTitleDone,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        <TagStatus type="task" status={task.status} size="small" />
      </View>

      {project && (
        <Text style={styles.taskProject} numberOfLines={1}>
          {project.title}
        </Text>
      )}

      {task.due_date && (
        <View style={styles.taskFooter}>
          <DeadlineBadge dueDate={task.due_date} size="small" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TasksScreen() {
  const myTasks = useMyTasks();
  const { tasksLoading } = useApp();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return myTasks;
    return myTasks.filter((t) => t.status === statusFilter);
  }, [myTasks, statusFilter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;

      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      return 0;
    });
  }, [filteredTasks]);

  if (tasksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Taskurile mele' }} />

      <View style={styles.filterContainer}>
        {(['all', 'todo', 'doing', 'done'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive,
              ]}
            >
              {status === 'all'
                ? 'Toate'
                : status === 'todo'
                ? 'De făcut'
                : status === 'doing'
                ? 'În lucru'
                : 'Finalizate'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sortedTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Niciun task"
          description={
            statusFilter === 'all'
              ? 'Nu ai taskuri asignate'
              : 'Nu ai taskuri cu acest status'
          }
        />
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.surface,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardDone: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  taskTitleRow: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskProject: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  taskFooter: {
    marginTop: 4,
  },
});
