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
  CreateSalesNoteInput
} from '@/types';

export const [AppContext, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [currentUser] = useState({ name: 'Andrei Ionescu', email: 'andrei@artinox.ro' });

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

  const salesNotesQuery = useQuery({
    queryKey: ['salesNotes'],
    queryFn: fakeApi.salesNotes.getAll,
  });

  const createProjectMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => fakeApi.projects.create(input),
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
    mutationFn: (input: CreatePaymentInput) => fakeApi.payments.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePaymentInput }) => 
      fakeApi.payments.update(id, input),
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

  const createSalesNoteMutation = useMutation({
    mutationFn: (input: CreateSalesNoteInput) => fakeApi.salesNotes.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] });
    },
  });

  const deleteSalesNoteMutation = useMutation({
    mutationFn: (id: string) => fakeApi.salesNotes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] });
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
    
    salesNotes: salesNotesQuery.data || [],
    salesNotesLoading: salesNotesQuery.isLoading,
    salesNotesError: salesNotesQuery.error,
    
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
    
    createSalesNote: createSalesNoteMutation.mutateAsync,
    deleteSalesNote: deleteSalesNoteMutation.mutateAsync,
    
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
    salesNotesQuery.data,
    salesNotesQuery.isLoading,
    salesNotesQuery.error,
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
    createSalesNoteMutation.mutateAsync,
    deleteSalesNoteMutation.mutateAsync,
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

export function useSalesNotesByProjectId(projectId: string | undefined) {
  const { salesNotes } = useApp();
  return useMemo(() => salesNotes.filter(n => n.project_id === projectId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [salesNotes, projectId]);
}
