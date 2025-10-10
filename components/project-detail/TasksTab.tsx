import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckSquare } from 'lucide-react-native';
import { useTasksByProjectId, useApp } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import DeadlineBadge from '@/components/DeadlineBadge';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Task, TaskStatus } from '@/types';

interface TasksTabProps {
  projectId: string;
}

function TaskItem({ task }: { task: Task }) {
  const { updateTask } = useApp();

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
        <Text
          style={[
            styles.taskTitle,
            task.status === 'done' && styles.taskTitleDone,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <TagStatus type="task" status={task.status} size="small" />
      </View>

      <View style={styles.taskFooter}>
        <Text style={styles.taskAssignee}>{task.assignee}</Text>
        {task.due_date && <DeadlineBadge dueDate={task.due_date} size="small" />}
      </View>
    </TouchableOpacity>
  );
}

export default function TasksTab({ projectId }: TasksTabProps) {
  const tasks = useTasksByProjectId(projectId);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;

    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;

    return 0;
  });

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Niciun task"
        description="Acest proiect nu are taskuri"
      />
    );
  }

  return (
    <View style={styles.container}>
      {sortedTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  taskCardDone: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskAssignee: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
