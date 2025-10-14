import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { fakeApi } from '@/api/fakeApi';
import type { 
  CreateProjectInput, 
  CreateTaskInput,
  CreatePaymentInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdatePaymentInput,
  Department,
  CreateFileInput,
  CreateChatMessageInput,
  User,
  CreateProjectMemberInput
} from '@/types';

export const [AppContext, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [currentUser] = useState<User>({
    id: '1',
    name: 'Andrei Ionescu',
    email: 'andrei@artinox.ro',
    role: 'sales',
    department: 'sales',
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fakeApi.projects.getAll,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: fakeApi.tasks.getAll,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: fakeApi.payments.getAll,
  });

  const filesQuery = useQuery({
    queryKey: ['files'],
    queryFn: fakeApi.files.getAll,
  });

  const chatMessagesQuery = useQuery({
    queryKey: ['chatMessages'],
    queryFn: fakeApi.chatMessages.getAll,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fakeApi.users.getAll,
  });

  const projectMembersQuery = useQuery({
    queryKey: ['projectMembers'],
    queryFn: fakeApi.projectMembers.getAll,
  });

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: fakeApi.clients.getAll,
  });

  const contractsQuery = useQuery({
    queryKey: ['contracts'],
    queryFn: fakeApi.contracts.getAll,
  });

  const createProjectMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => fakeApi.projects.create(input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) => 
      fakeApi.projects.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => fakeApi.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => fakeApi.tasks.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => 
      fakeApi.tasks.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => fakeApi.tasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (input: CreatePaymentInput) => fakeApi.payments.create(input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePaymentInput }) => 
      fakeApi.payments.update(id, input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => fakeApi.payments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const createFileMutation = useMutation({
    mutationFn: (input: CreateFileInput) => fakeApi.files.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => fakeApi.files.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const createChatMessageMutation = useMutation({
    mutationFn: (input: CreateChatMessageInput) => fakeApi.chatMessages.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
  });

  const deleteChatMessageMutation = useMutation({
    mutationFn: (id: string) => fakeApi.chatMessages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
  });

  const createProjectMemberMutation = useMutation({
    mutationFn: (input: CreateProjectMemberInput) => fakeApi.projectMembers.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
    },
  });

  const deleteProjectMemberMutation = useMutation({
    mutationFn: (id: string) => fakeApi.projectMembers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
    },
  });

  const toggleDepartmentAccess = useCallback(async (projectId: string, department: Department) => {
    const project = projectsQuery.data?.find(p => p.id === projectId);
    if (!project) return;

    await updateProjectMutation.mutateAsync({
      id: projectId,
      input: {
        access: {
          [department]: !project.access[department],
        },
      },
    });
  }, [projectsQuery.data, updateProjectMutation.mutateAsync]);

  const updateProject = useCallback((id: string, input: UpdateProjectInput) => 
    updateProjectMutation.mutateAsync({ id, input }), [updateProjectMutation.mutateAsync]);

  const updateTask = useCallback((id: string, input: UpdateTaskInput) => 
    updateTaskMutation.mutateAsync({ id, input }), [updateTaskMutation.mutateAsync]);

  const updatePayment = useCallback((id: string, input: UpdatePaymentInput) => 
    updatePaymentMutation.mutateAsync({ id, input }), [updatePaymentMutation.mutateAsync]);

  return useMemo(() => ({
    currentUser,
    
    projects: projectsQuery.data || [],
    projectsLoading: projectsQuery.isLoading,
    projectsError: projectsQuery.error,
    
    tasks: tasksQuery.data || [],
    tasksLoading: tasksQuery.isLoading,
    tasksError: tasksQuery.error,
    
    payments: paymentsQuery.data || [],
    paymentsLoading: paymentsQuery.isLoading,
    paymentsError: paymentsQuery.error,
    
    files: filesQuery.data || [],
    filesLoading: filesQuery.isLoading,
    filesError: filesQuery.error,
    
    chatMessages: chatMessagesQuery.data || [],
    chatMessagesLoading: chatMessagesQuery.isLoading,
    chatMessagesError: chatMessagesQuery.error,
    
    users: usersQuery.data || [],
    usersLoading: usersQuery.isLoading,
    usersError: usersQuery.error,
    
    projectMembers: projectMembersQuery.data || [],
    projectMembersLoading: projectMembersQuery.isLoading,
    projectMembersError: projectMembersQuery.error,
    
    clients: clientsQuery.data || [],
    clientsLoading: clientsQuery.isLoading,
    clientsError: clientsQuery.error,
    
    contracts: contractsQuery.data || [],
    contractsLoading: contractsQuery.isLoading,
    contractsError: contractsQuery.error,
    
    createProject: createProjectMutation.mutateAsync,
    updateProject,
    deleteProject: deleteProjectMutation.mutateAsync,
    
    createTask: createTaskMutation.mutateAsync,
    updateTask,
    deleteTask: deleteTaskMutation.mutateAsync,
    
    createPayment: createPaymentMutation.mutateAsync,
    updatePayment,
    deletePayment: deletePaymentMutation.mutateAsync,
    
    createFile: createFileMutation.mutateAsync,
    deleteFile: deleteFileMutation.mutateAsync,
    
    createChatMessage: createChatMessageMutation.mutateAsync,
    deleteChatMessage: deleteChatMessageMutation.mutateAsync,
    
    createProjectMember: createProjectMemberMutation.mutateAsync,
    deleteProjectMember: deleteProjectMemberMutation.mutateAsync,
    
    toggleDepartmentAccess,
  }), [
    currentUser,
    projectsQuery.data,
    projectsQuery.isLoading,
    projectsQuery.error,
    tasksQuery.data,
    tasksQuery.isLoading,
    tasksQuery.error,
    paymentsQuery.data,
    paymentsQuery.isLoading,
    paymentsQuery.error,
    filesQuery.data,
    filesQuery.isLoading,
    filesQuery.error,
    chatMessagesQuery.data,
    chatMessagesQuery.isLoading,
    chatMessagesQuery.error,
    usersQuery.data,
    usersQuery.isLoading,
    usersQuery.error,
    projectMembersQuery.data,
    projectMembersQuery.isLoading,
    projectMembersQuery.error,
    clientsQuery.data,
    clientsQuery.isLoading,
    clientsQuery.error,
    contractsQuery.data,
    contractsQuery.isLoading,
    contractsQuery.error,
    createProjectMutation.mutateAsync,
    updateProject,
    deleteProjectMutation.mutateAsync,
    createTaskMutation.mutateAsync,
    updateTask,
    deleteTaskMutation.mutateAsync,
    createPaymentMutation.mutateAsync,
    updatePayment,
    deletePaymentMutation.mutateAsync,
    createFileMutation.mutateAsync,
    deleteFileMutation.mutateAsync,
    createChatMessageMutation.mutateAsync,
    deleteChatMessageMutation.mutateAsync,
    createProjectMemberMutation.mutateAsync,
    deleteProjectMemberMutation.mutateAsync,
    toggleDepartmentAccess,
  ]);
});

export function useProjectById(id: string | undefined) {
  const { projects } = useApp();
  return useMemo(() => projects.find(p => p.id === id), [projects, id]);
}

export function useTasksByProjectId(projectId: string | undefined) {
  const { tasks } = useApp();
  return useMemo(() => tasks.filter(t => t.project_id === projectId), [tasks, projectId]);
}

export function usePaymentsByProjectId(projectId: string | undefined) {
  const { payments } = useApp();
  return useMemo(() => payments.filter(p => p.project_id === projectId), [payments, projectId]);
}

export function useMyTasks() {
  const { tasks, currentUser } = useApp();
  return useMemo(() => tasks.filter(t => t.assignee === currentUser.name), [tasks, currentUser.name]);
}

export function useProjectFinancials(projectId: string | undefined) {
  const payments = usePaymentsByProjectId(projectId);
  
  return useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
    const remaining = total - paid;
    
    return { total, paid, remaining };
  }, [payments]);
}

export function useFilesByProjectId(projectId: string | undefined) {
  const { files } = useApp();
  return useMemo(() => files.filter(f => f.project_id === projectId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [files, projectId]);
}

export function useChatMessagesByProjectId(projectId: string | undefined) {
  const { chatMessages } = useApp();
  return useMemo(() => chatMessages.filter(m => m.project_id === projectId).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ), [chatMessages, projectId]);
}

export function useUserById(userId: string | undefined) {
  const { users } = useApp();
  return useMemo(() => users.find(u => u.id === userId), [users, userId]);
}

export function useUsersByDepartment(department: Department) {
  const { users } = useApp();
  return useMemo(() => users.filter(u => u.department === department), [users, department]);
}

export function useProjectMembersByProjectId(projectId: string | undefined) {
  const { projectMembers } = useApp();
  return useMemo(() => projectMembers.filter(pm => pm.project_id === projectId), [projectMembers, projectId]);
}

export function useProjectMembersByUserId(userId: string | undefined) {
  const { projectMembers } = useApp();
  return useMemo(() => projectMembers.filter(pm => pm.user_id === userId), [projectMembers, userId]);
}

export function useVisibleProjects() {
  const { projects, currentUser, projectMembers } = useApp();
  
  return useMemo(() => {
    if (currentUser.role === 'admin') {
      return projects;
    }
    
    return projects.filter(project => {
      const hasAccess = project.access[currentUser.department];
      const isMember = projectMembers.some(
        pm => pm.project_id === project.id && pm.user_id === currentUser.id
      );
      return hasAccess || isMember;
    });
  }, [projects, currentUser, projectMembers]);
}

export function useTasksByUserId(userId: string | undefined) {
  const { tasks, users } = useApp();
  const user = useMemo(() => users.find(u => u.id === userId), [users, userId]);
  
  return useMemo(() => {
    if (!user) return [];
    return tasks.filter(t => t.assignee === user.name);
  }, [tasks, user]);
}
