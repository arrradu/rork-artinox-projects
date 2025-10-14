import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { CheckSquare, AlertCircle, Plus, X } from 'lucide-react-native';
import { useTasksByProjectId, useApp } from '@/contexts/AppContext';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import DeadlineBadge from '@/components/DeadlineBadge';
import EmptyState from '@/components/EmptyState';
import { formatDateShort, formatDateToISO, getCurrentDateDisplay } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { Task, TaskStatus } from '@/types';

interface TasksTabProps {
  projectId: string;
}

function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function TaskItem({ task }: { task: Task }) {
  const { updateTask } = useApp();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus });
  };

  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();
  const daysOverdue = isOverdue && task.due_date ? getDaysOverdue(task.due_date) : 0;

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
          <View style={styles.overdueContainer}>
            <View style={styles.overdueBadge}>
              <AlertCircle size={14} color={colors.error} />
              <Text style={styles.overdueText}>Depășit cu {daysOverdue} {daysOverdue === 1 ? 'zi' : 'zile'}</Text>
            </View>
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

export default function TasksTab({ projectId }: TasksTabProps) {
  const tasks = useTasksByProjectId(projectId);
  const { createTask, users } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Eroare', 'Titlul taskului este obligatoriu');
      return;
    }
    if (!assignee.trim()) {
      Alert.alert('Eroare', 'Responsabilul este obligatoriu');
      return;
    }

    setIsSubmitting(true);
    try {
      let dueDateISO: string | undefined = undefined;
      if (dueDate.trim()) {
        try {
          dueDateISO = formatDateToISO(dueDate);
        } catch {
          Alert.alert('Eroare', 'Formatul datei trebuie să fie DD-MM-YYYY');
          setIsSubmitting(false);
          return;
        }
      }

      await createTask({
        project_id: projectId,
        title: title.trim(),
        assignee: assignee.trim(),
        due_date: dueDateISO,
        status: 'todo',
      });

      setTitle('');
      setAssignee('');
      setDueDate('');
      setShowModal(false);
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut crea taskul');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Adaugă task</Text>
      </TouchableOpacity>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Niciun task"
          description="Apasă butonul de mai sus pentru a adăuga primul task"
        />
      ) : (
        sortedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task nou</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titlu *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex: Verificare documentație"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Responsabil *</Text>
                <TextInput
                  style={styles.input}
                  value={assignee}
                  onChangeText={setAssignee}
                  placeholder="Nume responsabil"
                  placeholderTextColor={colors.textSecondary}
                />
                {users.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {users.slice(0, 5).map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.suggestionItem}
                        onPress={() => setAssignee(user.name)}
                      >
                        <Text style={styles.suggestionText}>{user.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Deadline (DD-MM-YYYY)</Text>
                <TextInput
                  style={styles.input}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder={getCurrentDateDisplay()}
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.helperText}>Format: DD-MM-YYYY (ex: 15-01-2025)</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleCreateTask}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Se creează...' : 'Creează task'}
                </Text>
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
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginBottom: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
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
  overdueContainer: {
    flex: 1,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.error,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  doneAtText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  statusToggleContainer: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  suggestionsContainer: {
    marginTop: 8,
    gap: 6,
  },
  suggestionItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
