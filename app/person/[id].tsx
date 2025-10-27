import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { FolderOpen, CheckSquare, Calendar, AlertCircle } from 'lucide-react-native';
import {
  useApp,
  useUserById,
  useTasksByUserId,
  useProjectMembersByUserId,
  useVisibleProjects,
} from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import TaskStatusToggle from '@/components/TaskStatusToggle';
import TagStatus from '@/components/TagStatus';
import DeadlineBadge from '@/components/DeadlineBadge';
import { formatDateToDisplay, formatDateShort } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { Task, TaskStatus, Project } from '@/types';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

function TaskItem({ task, project, onStatusChange }: TaskItemProps) {
  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus);
  };

  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  return (
    <View style={[styles.taskCard, task.status === 'done' && styles.taskCardDone]}>
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
      </View>

      {project && (
        <Text style={styles.taskProject} numberOfLines={1}>
          {project.name}
        </Text>
      )}

      <View style={styles.taskMeta}>
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

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

function ProjectCard({ project, onPress }: ProjectCardProps) {
  const { clients } = useApp();
  const client = clients.find(c => c.id === project.client_id);

  return (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle} numberOfLines={2}>
          {project.name}
        </Text>
        <TagStatus type="project" status={project.status} size="small" />
      </View>
      <Text style={styles.projectClient} numberOfLines={1}>
        {client?.name || 'N/A'}
      </Text>
    </TouchableOpacity>
  );
}

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateTask, usersLoading, projectMembers } = useApp();
  const user = useUserById(id);
  const userTasks = useTasksByUserId(id);
  const userProjectMembers = useProjectMembersByUserId(id);
  const visibleProjects = useVisibleProjects();

  const [showOnlyOverdue, setShowOnlyOverdue] = useState<boolean>(false);
  const [showOnlyActiveProjects, setShowOnlyActiveProjects] = useState<boolean>(false);
  const [hideDone, setHideDone] = useState<boolean>(false);

  const userProjects = useMemo(() => {
    const projectIds = userProjectMembers.map(pm => pm.project_id);
    let projects = visibleProjects.filter(p => projectIds.includes(p.id));
    
    if (showOnlyActiveProjects) {
      projects = projects.filter(p => 
        p.status !== 'finalizat' && p.status !== 'anulat'
      );
    }
    
    return projects.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [userProjectMembers, visibleProjects, showOnlyActiveProjects]);

  const tasksByStatus = useMemo(() => {
    const today = new Date();
    
    let filteredTasks = userTasks;
    
    if (showOnlyOverdue) {
      filteredTasks = filteredTasks.filter(t => {
        if (t.status === 'done') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < today;
      });
    }
    
    if (hideDone) {
      filteredTasks = filteredTasks.filter(t => t.status !== 'done');
    }

    const todo = filteredTasks.filter(t => t.status === 'todo');
    const doing = filteredTasks.filter(t => t.status === 'doing');
    const done = filteredTasks.filter(t => t.status === 'done');

    return { todo, doing, done };
  }, [userTasks, showOnlyOverdue, hideDone]);

  const nextDeadline = useMemo(() => {
    const today = new Date();
    const upcomingTasks = userTasks
      .filter(t => t.status !== 'done' && t.due_date)
      .filter(t => new Date(t.due_date!) >= today)
      .sort((a, b) => 
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      );
    
    return upcomingTasks[0]?.due_date;
  }, [userTasks]);

  const overdueCount = useMemo(() => {
    const today = new Date();
    return userTasks.filter(t => {
      if (t.status === 'done') return false;
      if (!t.due_date) return false;
      return new Date(t.due_date) < today;
    }).length;
  }, [userTasks]);

  const openCount = useMemo(() => {
    return userTasks.filter(t => t.status !== 'done').length;
  }, [userTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  if (usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Persoană' }} />
        <EmptyState
          icon={AlertCircle}
          title="Utilizator negăsit"
          description="Nu am putut găsi utilizatorul solicitat"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: user.name }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>
              {user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.statsContainer}>
              {overdueCount > 0 && (
                <View style={[styles.statBadge, styles.statBadgeOverdue]}>
                  <AlertCircle size={14} color={colors.error} />
                  <Text style={styles.statTextOverdue}>
                    Overdue: {overdueCount}
                  </Text>
                </View>
              )}
              <View style={styles.statBadge}>
                <Text style={styles.statText}>Deschise: {openCount}</Text>
              </View>
              {nextDeadline && (
                <View style={styles.statBadge}>
                  <Calendar size={14} color={colors.primary} />
                  <Text style={styles.statText}>
                    Next: {formatDateToDisplay(nextDeadline)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FolderOpen size={20} color={colors.text} />
              <Text style={styles.sectionTitle}>Proiecte implicate</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.filterChip,
                showOnlyActiveProjects && styles.filterChipActive,
              ]}
              onPress={() => setShowOnlyActiveProjects(!showOnlyActiveProjects)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  showOnlyActiveProjects && styles.filterChipTextActive,
                ]}
              >
                Doar active
              </Text>
            </TouchableOpacity>
          </View>

          {userProjects.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                {showOnlyActiveProjects
                  ? 'Niciun proiect activ'
                  : 'Nu este implicat în niciun proiect'}
              </Text>
            </View>
          ) : (
            <View style={styles.projectsList}>
              {userProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={() => handleProjectPress(project.id)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <CheckSquare size={20} color={colors.text} />
              <Text style={styles.sectionTitle}>Taskuri</Text>
            </View>
            <View style={styles.filterChipsRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  showOnlyOverdue && styles.filterChipActive,
                ]}
                onPress={() => setShowOnlyOverdue(!showOnlyOverdue)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    showOnlyOverdue && styles.filterChipTextActive,
                  ]}
                >
                  Doar overdue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  hideDone && styles.filterChipActive,
                ]}
                onPress={() => setHideDone(!hideDone)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    hideDone && styles.filterChipTextActive,
                  ]}
                >
                  Ascunde Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {tasksByStatus.todo.length === 0 &&
           tasksByStatus.doing.length === 0 &&
           tasksByStatus.done.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                {showOnlyOverdue
                  ? 'Niciun task overdue'
                  : 'Nu are taskuri asignate'}
              </Text>
            </View>
          ) : (
            <>
              {tasksByStatus.todo.length > 0 && (
                <View style={styles.taskGroup}>
                  <Text style={styles.taskGroupTitle}>De făcut</Text>
                  {tasksByStatus.todo.map(task => {
                    const project = visibleProjects.find(p => p.id === task.project_id);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={project}
                        onStatusChange={handleStatusChange}
                      />
                    );
                  })}
                </View>
              )}

              {tasksByStatus.doing.length > 0 && (
                <View style={styles.taskGroup}>
                  <Text style={styles.taskGroupTitle}>În lucru</Text>
                  {tasksByStatus.doing.map(task => {
                    const project = visibleProjects.find(p => p.id === task.project_id);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={project}
                        onStatusChange={handleStatusChange}
                      />
                    );
                  })}
                </View>
              )}

              {tasksByStatus.done.length > 0 && (
                <View style={styles.taskGroup}>
                  <Text style={styles.taskGroupTitle}>Realizat</Text>
                  {tasksByStatus.done.map(task => {
                    const project = visibleProjects.find(p => p.id === task.project_id);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={project}
                        onStatusChange={handleStatusChange}
                      />
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitials: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    gap: 4,
  },
  statBadgeOverdue: {
    backgroundColor: `${colors.error}15`,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  statTextOverdue: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.error,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  emptySection: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  projectTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  projectClient: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  taskGroup: {
    marginBottom: 16,
  },
  taskGroupTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
