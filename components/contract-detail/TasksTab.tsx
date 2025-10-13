import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckSquare, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import DeadlineBadge from '@/components/DeadlineBadge';
import EmptyState from '@/components/EmptyState';
import { formatDateShort } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { Task, TaskStatus } from '@/types';

interface TasksTabProps {
  contractId: string;
}

function TaskItem({ task }: { task: Task }) {
  const { updateTask } = useApp();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus });
  };

  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  return (
    <View style={[styles.taskCard, task.status === 'done' && styles.taskCardDone]}>
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
      </View>

      <View style={styles.taskMeta}>
        <Text style={styles.taskAssignee}>{task.assignee}</Text>
        {isOverdue && (
          <View style={styles.overdueBadge}>
            <AlertCircle size={14} color={colors.error} />
            <Text style={styles.overdueText}>Întârziat</Text>
          </View>
        )}
        {task.due_date && <DeadlineBadge dueDate={task.due_date} size="small" />}
      </View>

      {task.status === 'done' && task.done_at && (
        <Text style={styles.doneAtText}>
          Finalizat la: {formatDateShort(task.done_at)}
        </Text>
      )}

      <View style={styles.statusToggleContainer}>
        <TaskStatusToggle status={task.status} onChange={handleStatusChange} />
      </View>
    </View>
  );
}

export default function TasksTab({ contractId }: TasksTabProps) {
  const { tasks } = useApp();
  
  const contractTasks = tasks.filter(t => t.contract_id === contractId);

  const sortedTasks = [...contractTasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;

    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;

    return 0;
  });

  if (contractTasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Niciun task"
        description="Acest contract nu are taskuri"
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
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  taskAssignee: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${colors.error}15`,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.error,
  },
  doneAtText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  statusToggleContainer: {
    marginTop: 4,
  },
});
